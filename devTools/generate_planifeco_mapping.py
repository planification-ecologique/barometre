#!/usr/bin/env python3
"""
Script to generate planifeco_mapping.js from the Excel file.
This script reads Planifeco_Référentiel de la planification_20260113.xlsx
and generates the mapping file for all sectors.
"""

import pandas as pd
import json
import sys
import os
import re

# Define paths
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
excel_file = os.path.join(project_root, 'app', 'public', 'data-chantiers', 'Planifeco_Référentiel de la planification_20260113.xlsx')
output_file = os.path.join(project_root, 'app', 'src', 'utils', 'planifeco_mapping.js')

# Define sector mapping - using names from Excel columns
# For Engagements sheet: use column names directly
sector_mapping = {
    'ID grist engagements': 'Général',
    'ID transports': 'Transports',
    'ID agri/alim': 'Agriculture / alimentation',  # From Excel column name
    'ID industrie': 'Industrie',
    'ID bâtiments': 'Bâtiments et urbanisme',  # From Excel column name
    'ID énergie': "Production d'énergie",  # From Excel column name
    'ID déchets': 'Consommations et déchets',  # Normalized from "Déchets / consommation"
    'ID puits': 'Terres et forêts'  # From Excel column name
}

# Sector name mapping from Leviers sheet to standard names (using Excel column names)
levier_sector_mapping = {
    'Transport': 'Transports',
    'Agriculture': 'Agriculture / alimentation',  # From Excel
    'Industrie': 'Industrie',
    'Bâtiment': 'Bâtiments et urbanisme',  # From Excel
    "Production et transformation d'énergie": "Production d'énergie",  # Normalized
    'Déchets / ressources': 'Consommations et déchets',
    'Aménagement': 'Général',
    'Ecosystèmes': 'Terres et forêts',  # From Excel
    'Puits': 'Terres et forêts',
    'Terres': 'Terres et forêts',
    'Forêts': 'Terres et forêts'
}

# Normalize sector names - ensure consistent naming
sector_normalization = {
    'Terres & forêts': 'Terres et forêts',  # Normalize & to et
    'Terres & Forêts': 'Terres et forêts',
}

def normalize_sector(sector):
    """Normalize sector name to use Excel column names."""
    if not sector:
        return 'Général'
    return sector_normalization.get(sector, sector)

def is_valid_grist_id(grist_id):
    """Check if a grist_id is a valid UUID format."""
    if not grist_id or not isinstance(grist_id, str):
        return False
    grist_id = grist_id.strip()
    # UUID format: 8-4-4-4-12 hexadecimal characters separated by hyphens
    uuid_pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    return bool(re.match(uuid_pattern, grist_id, re.IGNORECASE))

def extract_valid_grist_ids(id_string):
    """Extract valid UUIDs from a string that may contain multiple IDs separated by newlines.
    Invalid IDs are ignored (treated as if the cell was empty)."""
    if pd.isna(id_string) or not id_string:
        return []
    id_str = str(id_string).strip()
    # Split by newlines and filter valid UUIDs
    ids = [id.strip() for id in id_str.split('\n') if id.strip()]
    valid_ids = [id for id in ids if is_valid_grist_id(id)]
    return valid_ids

def generate_mapping():
    """Generate the mapping file from Excel data."""
    
    if not os.path.exists(excel_file):
        print(f"Error: Excel file not found at {excel_file}")
        sys.exit(1)
    
    print(f"Reading Excel file: {excel_file}")
    
    # Read sheets
    df_engagements = pd.read_excel(excel_file, sheet_name='Grist Engagements')
    df_engagements_detail = pd.read_excel(excel_file, sheet_name='Engagements')  # For taxonomy axes
    df_leviers = pd.read_excel(excel_file, sheet_name='Leviers')
    # Note: We don't use 'Grist chantiers-leviers' sheet - only 'Leviers' sheet is authoritative
    
    # Create a mapping from theme to taxonomy axis
    theme_to_axe = {}
    for idx, row in df_engagements_detail.iterrows():
        if pd.notna(row['Thème']) and pd.notna(row['Axe']):
            theme = str(row['Thème']).strip()
            axe = str(row['Axe']).strip()
            theme_to_axe[theme] = axe
    
    # Extract sectors that have data
    sectors = []
    for col, sector_name in sector_mapping.items():
        if col in df_engagements.columns:
            has_data = False
            for idx, row in df_engagements.iterrows():
                if pd.notna(row[col]) and str(row[col]).strip():
                    has_data = True
                    break
            if has_data:
                sectors.append(sector_name)
    
    # Normalize sector names
    sectors = [normalize_sector(s) for s in sectors]
    
    # Always include "Terres et forêts" even if no data yet
    if 'Terres et forêts' not in sectors:
        sectors.append('Terres et forêts')
    
    print(f"Sectors found: {sectors}")
    
    # Build mapping structure
    mapping = {
        'sectors': sectors,
        'engagements': {},
        'chantiers': {},
        'leviers': {}
    }
    
    # Process engagements for each sector
    engagement_counter = 0
    for idx, row in df_engagements.iterrows():
        theme = row['Thème']
        if pd.isna(theme):
            continue
        
        # Process each sector column
        for col, sector_name in sector_mapping.items():
            if col in df_engagements.columns and pd.notna(row[col]):
                # Extract valid UUIDs only (invalid IDs are ignored)
                grist_ids = extract_valid_grist_ids(row[col])
                
                if grist_ids:
                    engagement_id = f"eng_{sector_name}_{idx}_{engagement_counter}"
                    engagement_counter += 1
                    # Get taxonomy axis for this theme
                    taxonomy_axe = theme_to_axe.get(theme, 'Autre')
                    mapping['engagements'][engagement_id] = {
                        'id': engagement_id,
                        'name': theme,
                        'theme': theme,
                        'sector': sector_name,
                        'taxonomy_axe': taxonomy_axe,
                        'grist_ids': grist_ids
                    }
    
    # Note: We don't use 'Grist chantiers-leviers' sheet - only 'Leviers' sheet is authoritative
    # All chantier-levier associations come from the 'Leviers' sheet
    
    # Build a set of chantier IDs that have explicit ID grist in Leviers sheet
    chantiers_with_id_grist_from_leviers = set()
    for idx, row in df_leviers.iterrows():
        if pd.notna(row['Chantier']) and pd.notna(row['ID grist']):
            # Extract valid UUIDs only (invalid IDs are ignored)
            chantier_ids = extract_valid_grist_ids(row['ID grist'])
            chantiers_with_id_grist_from_leviers.update(chantier_ids)
    
    # Process chantiers from Leviers sheet
    # Handle grouped rows where only the first row has the chantier name
    # Also handle cases where a chantier has multiple IDs (separated by newlines)
    # Also handle cases where a chantier doesn't have an ID grist (find it from levier associations)
    chantier_info = {}
    current_chantier_ids = []  # List of IDs for current chantier group
    current_chantier_name = None
    current_chantier_sector = None
    
    for idx, row in df_leviers.iterrows():
        # Check if this row has a chantier (new group starts)
        if pd.notna(row['Chantier']):
            current_chantier_name = str(row['Chantier']).strip()
            
            # Check if this row has an ID grist
            # The ID grist applies to the entire chantier (which may span multiple merged rows)
            if pd.notna(row['ID grist']):
                # Extract valid UUIDs only (invalid IDs are ignored)
                current_chantier_ids = extract_valid_grist_ids(row['ID grist'])
            else:
                # No ID grist - chantier will be created without grist_ids (but can still have leviers)
                current_chantier_ids = []
            
            # Determine sector from "Secteurs du levier >>" column or sector columns
            current_chantier_sector = None
            if 'Secteurs du levier >>' in df_leviers.columns and pd.notna(row['Secteurs du levier >>']):
                sector_str = str(row['Secteurs du levier >>']).strip()
                current_chantier_sector = levier_sector_mapping.get(sector_str, sector_str)
            else:
                # Check individual sector columns
                for sector_col in ['Transport', 'Agriculture', 'Industrie', 'Bâtiment', "Production et transformation d'énergie", 'Déchets / ressources', 'Ecosystèmes']:
                    if sector_col in df_leviers.columns and pd.notna(row[sector_col]):
                        current_chantier_sector = levier_sector_mapping.get(sector_col, sector_col)
                        break
            
            if not current_chantier_sector:
                current_chantier_sector = 'Général'  # Default
            
            # Collect levier IDs for this chantier (needed for creating chantiers without grist_ids)
            levier_ids_for_chantier = []
            chantier_row_idx = idx if pd.notna(row.get('Chantier')) else None
            if chantier_row_idx is not None:
                # Collect from current row
                if pd.notna(row.get('ID grist.1')):
                    # Extract valid UUIDs only
                    levier_ids_for_chantier.extend(extract_valid_grist_ids(row['ID grist.1']))
                # Also collect from grouped rows (merged rows where only first row has chantier name)
                for idx2 in range(chantier_row_idx + 1, len(df_leviers)):
                    row2 = df_leviers.iloc[idx2]
                    if pd.notna(row2.get('Chantier')):
                        break  # Stop when we hit another chantier
                    if pd.notna(row2.get('ID grist.1')):
                        # Extract valid UUIDs only
                        levier_ids_for_chantier.extend(extract_valid_grist_ids(row2['ID grist.1']))
            
            # Create chantier entries for each ID (use first ID as primary)
            if current_chantier_name and current_chantier_ids:
                primary_id = current_chantier_ids[0]
                # Check if we have an ID grist in the row (chantier created from Leviers with ID)
                has_id_grist = pd.notna(row['ID grist'])
                
                if primary_id not in mapping['chantiers']:
                    # Create new chantier
                    # Only use the first ID as grist_id (primary ID)
                    # Other IDs in the list might be incorrect or from other sources
                    mapping['chantiers'][primary_id] = {
                        'id': primary_id,
                        'name': current_chantier_name,
                        'sector': current_chantier_sector,
                        'grist_ids': [primary_id],  # Only use primary ID, not all IDs
                        'leviers': []
                    }
                    chantier_info[primary_id] = {'name': current_chantier_name, 'sector': current_chantier_sector}
                else:
                    # Chantier already exists - check if it's the same
                    existing_chantier = mapping['chantiers'][primary_id]
                    if existing_chantier['name'] != current_chantier_name or existing_chantier.get('sector') != current_chantier_sector:
                        # Different chantier - clear IDs and create without grist_ids
                        current_chantier_ids = []
                    else:
                        # Same chantier - ensure only primary ID is in grist_ids
                        if mapping['chantiers'][primary_id]['grist_ids'] != [primary_id]:
                            mapping['chantiers'][primary_id]['grist_ids'] = [primary_id]
                        chantier_info[primary_id] = {'name': current_chantier_name, 'sector': current_chantier_sector}
            elif current_chantier_name and not current_chantier_ids:
                # Chantier without any valid ID grist - try to find IDs from Grist chantiers-leviers
                # Find levier IDs for this chantier (including grouped/merged rows)
                levier_ids_for_chantier = []
                chantier_row_idx = None
                for idx2, row2 in df_leviers.iterrows():
                    if pd.notna(row2.get('Chantier')) and str(row2['Chantier']).strip() == current_chantier_name:
                        chantier_row_idx = idx2
                        if pd.notna(row2.get('ID grist.1')):
                            # Extract valid UUIDs only
                            levier_ids_for_chantier.extend(extract_valid_grist_ids(row2['ID grist.1']))
                        break
                
                # Also collect leviers from grouped/merged rows (rows without Chantier after the chantier row)
                if chantier_row_idx is not None:
                    for idx2 in range(chantier_row_idx + 1, len(df_leviers)):
                        row2 = df_leviers.iloc[idx2]
                        # Stop if we hit another chantier
                        if pd.notna(row2.get('Chantier')):
                            break
                        # Collect levier IDs from grouped rows
                        if pd.notna(row2.get('ID grist.1')):
                            # Extract valid UUIDs only
                            levier_ids_for_chantier.extend(extract_valid_grist_ids(row2['ID grist.1']))
                
                # Note: We don't use 'Grist chantiers-leviers' sheet - only 'Leviers' sheet is authoritative
                # Chantiers without ID grist will be created with generated IDs
                
                if current_chantier_ids:
                    # Create chantier with found ID
                    primary_id = current_chantier_ids[0]
                    if primary_id not in mapping['chantiers']:
                        mapping['chantiers'][primary_id] = {
                            'id': primary_id,
                            'name': current_chantier_name,
                            'sector': current_chantier_sector,
                            'grist_ids': [primary_id],  # Only use primary ID, not all IDs
                            'leviers': []
                        }
                        chantier_info[primary_id] = {'name': current_chantier_name, 'sector': current_chantier_sector}
                    else:
                        # ID already exists - check if it's the same chantier
                        existing_chantier = mapping['chantiers'][primary_id]
                        if existing_chantier['name'] != current_chantier_name or existing_chantier.get('sector') != current_chantier_sector:
                            # Different chantier - clear IDs so we create without grist_ids instead
                            current_chantier_ids = []
                            # Continue to create chantier without grist_ids below
                
                if not current_chantier_ids and levier_ids_for_chantier:
                    # No ID grist found, but has leviers - create chantier without grist_ids
                    # Generate a unique ID based on chantier name and sector
                    import hashlib
                    unique_string = f"{current_chantier_name}_{current_chantier_sector}"
                    hash_obj = hashlib.md5(unique_string.encode('utf-8'))
                    generated_id = hash_obj.hexdigest()[:8] + '-' + hash_obj.hexdigest()[8:12] + '-' + hash_obj.hexdigest()[12:16] + '-' + hash_obj.hexdigest()[16:20] + '-' + hash_obj.hexdigest()[20:32]
                    
                    # Check if this ID already exists (unlikely but possible)
                    if generated_id not in mapping['chantiers']:
                        mapping['chantiers'][generated_id] = {
                            'id': generated_id,
                            'name': current_chantier_name,
                            'sector': current_chantier_sector,
                            'grist_ids': [],  # Empty - no indicators for the chantier itself
                            'leviers': []
                        }
                        chantier_info[generated_id] = {'name': current_chantier_name, 'sector': current_chantier_sector}
                        print(f"Created chantier '{current_chantier_name}' without grist_ids (ID: {generated_id}) - will show levier indicators only")
                    else:
                        # ID collision - use existing chantier
                        existing_chantier = mapping['chantiers'][generated_id]
                        if existing_chantier['name'] == current_chantier_name and existing_chantier.get('sector') == current_chantier_sector:
                            chantier_info[generated_id] = {'name': current_chantier_name, 'sector': current_chantier_sector}
                elif not current_chantier_ids and not levier_ids_for_chantier:
                    # Debug: why is this chantier not being created?
                    if 'poids lourds' in current_chantier_name.lower():
                        print(f"DEBUG: Chantier '{current_chantier_name}' - current_chantier_ids={current_chantier_ids}, levier_ids_for_chantier={len(levier_ids_for_chantier) if levier_ids_for_chantier else 0}")
                else:
                    # Still no ID and no leviers - skip
                    print(f"Warning: Chantier '{current_chantier_name}' has no ID grist and no associated levier IDs found")
        
        # If we're in a group (have current_chantier_ids) but this row doesn't have a chantier,
        # check if we need to update the sector from this row's sector columns
        elif current_chantier_ids and len(current_chantier_ids) > 0:
            primary_id = current_chantier_ids[0]
            if primary_id in mapping['chantiers']:
                # Check if this row has sector information that might be more specific
                row_sector = None
                if 'Secteurs du levier >>' in df_leviers.columns and pd.notna(row['Secteurs du levier >>']):
                    sector_str = str(row['Secteurs du levier >>']).strip()
                    row_sector = levier_sector_mapping.get(sector_str, sector_str)
                else:
                    for sector_col in ['Transport', 'Agriculture', 'Industrie', 'Bâtiment', "Production et transformation d'énergie", 'Déchets / ressources', 'Ecosystèmes']:
                        if sector_col in df_leviers.columns and pd.notna(row[sector_col]):
                            row_sector = levier_sector_mapping.get(sector_col, sector_col)
                            break
                
                # Update sector if we found one and it's different from current
                if row_sector:
                    row_sector = normalize_sector(row_sector)
                    if row_sector != current_chantier_sector:
                        mapping['chantiers'][primary_id]['sector'] = row_sector
                        current_chantier_sector = row_sector
    
    # Process leviers from Leviers sheet
    for idx, row in df_leviers.iterrows():
        if pd.notna(row['ID grist.1']):
            levier_id_str = str(row['ID grist.1']).strip()
            levier_ids = [id.strip() for id in levier_id_str.split('\n') if id.strip() and len(id.strip()) > 10 and '-' in id.strip()]
            
            # Get levier name
            levier_name_cols = ['Levier (intitulé usuel)', 'Levier']
            levier_name = None
            for col in levier_name_cols:
                if col in df_leviers.columns and pd.notna(row[col]):
                    levier_name = str(row[col]).strip()
                    break
            
            if not levier_name:
                levier_name = f"Levier {idx}"
            
            levier_short = None
            if 'Levier (intitulé court)' in df_leviers.columns and pd.notna(row['Levier (intitulé court)']):
                levier_short = str(row['Levier (intitulé court)']).strip()
            
            # Determine sector
            sector = None
            if 'Secteurs du levier >>' in df_leviers.columns and pd.notna(row['Secteurs du levier >>']):
                sector_str = str(row['Secteurs du levier >>']).strip()
                sector = levier_sector_mapping.get(sector_str, sector_str)
            else:
                for sector_col in ['Transport', 'Agriculture', 'Industrie', 'Bâtiment', "Production et transformation d'énergie", 'Déchets / ressources', 'Ecosystèmes']:
                    if sector_col in df_leviers.columns and pd.notna(row[sector_col]):
                        sector = levier_sector_mapping.get(sector_col, sector_col)
                        break
            
            if not sector:
                sector = 'Général'
            
            # Normalize sector name
            sector = normalize_sector(sector)
            
            for lid in levier_ids:
                if lid:
                    mapping['leviers'][lid] = {
                        'id': lid,
                        'name': levier_name,
                        'short_name': levier_short or levier_name,
                        'sector': sector,
                        'chantier_id': None,
                        'grist_ids': [lid]
                    }
    
    # Link leviers to chantiers using chantier ID from Leviers sheet
    # Handle grouped rows where only the first row has the chantier name
    # Also handle multiple chantier IDs per row
    # Also handle chantiers without ID grist (use name and sector to find them)
    current_chantier_ids = []
    current_chantier_name = None
    current_chantier_sector = None
    for idx, row in df_leviers.iterrows():
        # Check if this row has a chantier (new group starts)
        if pd.notna(row['Chantier']):
            current_chantier_name = str(row['Chantier']).strip()
            current_chantier_ids = []
            if pd.notna(row['ID grist']):
                # Extract valid UUIDs only (invalid IDs are ignored)
                current_chantier_ids = extract_valid_grist_ids(row['ID grist'])
            
            # Determine sector
            current_chantier_sector = None
            if 'Secteurs du levier >>' in df_leviers.columns and pd.notna(row['Secteurs du levier >>']):
                sector_str = str(row['Secteurs du levier >>']).strip()
                current_chantier_sector = levier_sector_mapping.get(sector_str, sector_str)
            else:
                for sector_col in ['Transport', 'Agriculture', 'Industrie', 'Bâtiment', "Production et transformation d'énergie", 'Déchets / ressources', 'Ecosystèmes']:
                    if sector_col in df_leviers.columns and pd.notna(row[sector_col]):
                        current_chantier_sector = levier_sector_mapping.get(sector_col, sector_col)
                        break
            if not current_chantier_sector:
                current_chantier_sector = 'Général'
        
        # Process levier if we have a current chantier (with or without IDs) and this row has a levier
        if current_chantier_name and pd.notna(row['ID grist.1']):
            # Extract valid UUIDs only
            levier_ids = extract_valid_grist_ids(row['ID grist.1'])
            
            # Find the chantier ID (either from current_chantier_ids or by name/sector)
            primary_chantier_id = None
            if current_chantier_ids:
                primary_chantier_id = current_chantier_ids[0]
            else:
                # No ID grist - find chantier by name and sector
                for cid, ch in mapping['chantiers'].items():
                    if ch['name'] == current_chantier_name and ch.get('sector') == current_chantier_sector:
                        primary_chantier_id = cid
                        break
            
            if primary_chantier_id and primary_chantier_id in mapping['chantiers']:
                for levier_id in levier_ids:
                    if levier_id in mapping['leviers']:
                        if levier_id not in mapping['chantiers'][primary_chantier_id]['leviers']:
                            mapping['chantiers'][primary_chantier_id]['leviers'].append(levier_id)
                        mapping['leviers'][levier_id]['chantier_id'] = primary_chantier_id
    
    # Also use the chantiers-leviers mapping sheet
    # Create a lookup: for each grist_id, find the primary chantier ID
    # Also track which chantiers were created from Leviers sheet with ID grist (more authoritative)
    grist_id_to_chantier_id = {}
    chantiers_with_id_grist = set()  # Chantiers created from Leviers with ID grist
    for chantier_id, chantier in mapping['chantiers'].items():
        for grist_id in chantier.get('grist_ids', []):
            grist_id_to_chantier_id[grist_id] = chantier_id
    
    # Mark chantiers created from Leviers with ID grist
    for idx, row in df_leviers.iterrows():
        if pd.notna(row['Chantier']) and pd.notna(row['ID grist']):
            # Extract valid UUIDs only (invalid IDs are ignored)
            chantier_ids = extract_valid_grist_ids(row['ID grist'])
            for cid in chantier_ids:
                if cid in mapping['chantiers']:
                    chantiers_with_id_grist.add(cid)
    
    # Build a map of levier IDs to chantier names and IDs (for chantiers without ID grist)
    # Also track which chantier each levier belongs to from Leviers sheet (more authoritative)
    levier_to_chantier_name = {}
    levier_to_chantier_id_from_leviers = {}  # Track which chantier each levier belongs to from Leviers sheet
    current_chantier_name_for_levier = None
    current_chantier_id_for_levier = None
    for idx, row in df_leviers.iterrows():
        if pd.notna(row['Chantier']):
            current_chantier_name_for_levier = str(row['Chantier']).strip()
            # Try to find the chantier ID for this name
            current_chantier_id_for_levier = None
            if pd.notna(row['ID grist']):
                chantier_ids_from_row = extract_valid_grist_ids(row['ID grist'])
                if chantier_ids_from_row:
                    current_chantier_id_for_levier = chantier_ids_from_row[0]
            # If no ID grist, try to find by name
            if not current_chantier_id_for_levier:
                for cid, ch in mapping['chantiers'].items():
                    if ch['name'] == current_chantier_name_for_levier:
                        current_chantier_id_for_levier = cid
                        break
        if current_chantier_name_for_levier and pd.notna(row.get('ID grist.1')):
            # Extract valid UUIDs only
            levier_ids = extract_valid_grist_ids(row['ID grist.1'])
            for levier_id in levier_ids:
                if levier_id not in levier_to_chantier_name:
                    levier_to_chantier_name[levier_id] = current_chantier_name_for_levier
                if current_chantier_id_for_levier and levier_id not in levier_to_chantier_id_from_leviers:
                    levier_to_chantier_id_from_leviers[levier_id] = current_chantier_id_for_levier
    
    # Note: We don't use 'Grist chantiers-leviers' sheet - only 'Leviers' sheet is authoritative
    # All chantier-levier associations have already been processed from the 'Leviers' sheet above
    
    # Final cleanup: ensure each chantier only has its primary ID in grist_ids
    # (unless it was explicitly set with multiple IDs from Leviers sheet with ID grist)
    for chantier_id, chantier in mapping['chantiers'].items():
        if chantier.get('grist_ids') and len(chantier.get('grist_ids', [])) > 1:
            # Check if the primary ID is in the list
            primary_id = chantier_id
            if primary_id in chantier.get('grist_ids', []):
                # Keep only the primary ID
                mapping['chantiers'][chantier_id]['grist_ids'] = [primary_id]
    
    # Convert to JSON and write
    output = json.dumps(mapping, indent=2, ensure_ascii=False)
    
    # Write to JavaScript file
    js_content = f"""// Auto-generated mapping from Planifeco Excel file
// Generated from: Planifeco_Référentiel de la planification_20260113.xlsx
// To regenerate this file, run: python3 devTools/generate_planifeco_mapping.py

export const planifecoMapping = {output};

export default planifecoMapping;
"""
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f"\n✓ Mapping file created: {output_file}")
    print(f"  Engagements: {len(mapping['engagements'])}")
    print(f"  Chantiers: {len(mapping['chantiers'])}")
    print(f"  Leviers: {len(mapping['leviers'])}")
    print(f"  Sectors: {', '.join(mapping['sectors'])}")

if __name__ == '__main__':
    generate_mapping()
