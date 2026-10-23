G=/mnt/project-files/scavenger-hunt/previews/lifestyle/tools/round4/gen_ref.py
mkdir -p out
gen(){ k=$1; refs=$(python3 -c "import json;print(' '.join('refs/$k-'+r+'.png' for r in json.load(open('refs.json'))['$k']))"); python3 $G out/$k.png prompts/$k.txt $refs; }
for k in pizza burger grocery post library; do gen $k & sleep 3; done; wait
for k in dentist petshop coffee italian auto; do gen $k & sleep 3; done; wait
