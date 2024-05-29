#!/bin/bash

# Variables
HADOOP_USER="hadoop"
HADOOP_HOST="localhost"
HADOOP_PORT="2222"
HADOOP_HOME="/home/hadoop"
LOCAL_FILE="noticias.txt"
REMOTE_FILE="/home/hadoop/resultado/part-r-00000"
REMOTE_SCRIPT="automatizacion.sh"
LOCAL_DEST="/home/smith/Documents/Proyectos/BigData/bigdata/src/assets/ejecucion"
HADOOP_PASSWORD="hadoop"

# Copiar noticias.txt al home de hadoop
sshpass -p $HADOOP_PASSWORD scp -P $HADOOP_PORT $LOCAL_FILE $HADOOP_USER@$HADOOP_HOST:$HADOOP_HOME

# Iniciar sesión en hadoop y ejecutar automatizado.sh
sshpass -p $HADOOP_PASSWORD ssh -p $HADOOP_PORT $HADOOP_USER@$HADOOP_HOST "bash $HADOOP_HOME/$REMOTE_SCRIPT"

# Copiar part-r-00000 de hadoop a la carpeta ejecucion en Ubuntu
sshpass -p $HADOOP_PASSWORD scp -P $HADOOP_PORT $HADOOP_USER@$HADOOP_HOST:$REMOTE_FILE $LOCAL_DEST

# Renombrar part-r-00000 a resultado.txt
mv $LOCAL_DEST/part-r-00000 $LOCAL_DEST/resultado.txt

echo "Proceso completado."
