#! /usr/bin/env python3
from os import listdir
import sys
import logging
import optparse

#logging.basicConfig(filename='../log/preparation_log.log',level=logging.DEBUG,\
logging.basicConfig(level=logging.DEBUG,\
    format='%(asctime)s -- %(lineno)d -- %(levelname)s -- %(module)-10s -- %(funcName)s -- %(message)s')
logger = logging.getLogger()
#logger.setLevel(logging.CRITICAL)

success=0
failure=1


def main():
#   """------------------ usage and options ------------------"""
    usage = "usage: %prog [options] server"
    parser = optparse.OptionParser(usage=usage)

    parser.add_option("-d", "--helm_directory", dest="directory", default=None, help="This parameter is required. Default : None")
    parser.add_option("-e", "--environnement", dest="environnement", default=None, help="This parameter is required. Default : None")
    
    (options, args) = parser.parse_args()

    if not options.directory or not options.environnement:
        msg = "Required parameter. More info please enter -h"
        logging.error(msg)
        print(msg)
        return failure 
            
    file_env ='build.env'
    create_env_variables(file_env, options.directory, options.environnement)
    return success

def create_env_variables(file_env:str, helms_directory:str, env:str):
    
    file_chart = f"{helms_directory}/Chart.yaml"
    logger.info(file_chart)
    package_name, chart_name = get_package_chart_name(file_chart)
    namespace = chart_name.replace("chart", env)
    helm_name = chart_name.replace("-chart", '')
    logger.info(chart_name)
    # chart_name = f"{ci_project_dir}/{chart_name}"

    with open(file_env, "a") as file:
        file.write(f"PACKAGE_VERSION={package_name}\n")
        file.write(f"PACKAGE_NAME={chart_name}\n")
        file.write(f"NAMESPACE={namespace}\n")
        file.write(f"HELM_NAME={helm_name}")
    file.close()

def get_package_chart_name(file_chart:str):
    f = open(file_chart,'r')
    lines = f.readlines()
    for row in lines:
        if row.startswith("name"):
            chart=row
        if row.startswith("version"):
            version=row
    f.close()

    chart_name=chart.split(" ")
    ver=version.split(" ")
    chart_name = chart_name[1].strip()
    package_name = chart_name + '-'+ver[1].strip()+'.tgz'
    return package_name, chart_name
    
    
# __main__

if __name__ == "__main__":
    answer = main()
    if answer == success:
        logging.info("Answer to return: success ({0})".format(answer))
        print("Answer to return: success ({0})".format(answer))
    elif answer == failure:
        logging.info("Answer to return: failure ({0})".format(answer))
        print("Answer to return: failure ({0})".format(answer))
    sys.exit(answer)
    