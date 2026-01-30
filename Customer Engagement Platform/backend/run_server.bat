@echo off
echo Running node server... > run_out.txt
node server.js >> run_out.txt 2>&1
echo Done >> run_out.txt
