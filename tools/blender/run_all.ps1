# Normalise all eight models (5 dinosaurs, then raptor, pteranodon, pliosaur): GLB + USDZ + poster, then verify, then write models.json / CREDITS.md.
# Usage:  powershell -File run_all.ps1 [-ModelsRoot <dir>] [-Out <dir>] [-Scratch <dir>] [-Blender <exe>]
param(
  [string]$ModelsRoot = 'F:\Temp\claude\ec1e086069f15c18\385cf4b4-a6a8-4a35-97e2-93a9feef9417\scratchpad\models',
  [string]$Out        = 'F:\Claude code\dino\assets\models',
  [string]$Scratch    = 'F:\Temp\claude\ec1e086069f15c18\385cf4b4-a6a8-4a35-97e2-93a9feef9417\scratchpad\fix',
  [string]$Blender    = 'E:\blender\5.2\blender.exe'
)
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
New-Item -ItemType Directory -Force $Out, $Scratch | Out-Null
foreach ($id in 'trex','pterosaur','ankylosaurus','diplodocus','carnotaurus','raptor','pteranodon','pliosaur') {
  Write-Host "=== $id ==="
  & $Blender -b --factory-startup --python "$here\dino_normalize.py" -- --id $id --models-root $ModelsRoot --out $Out --scratch $Scratch
  & $Blender -b --factory-startup --python "$here\dino_verify.py"   -- --id $id --out $Out --scratch $Scratch --sheets
  python -I "$here\glb_skin_check.py" "$Out\$id.glb"     # independent CPU-skinning check of the GLB animation
}
python -I "$here\make_manifest.py" $ModelsRoot $Out $Scratch
# AR variants: 1:10 'mini' and life-size 'far' (origin at the nose so the animal lies behind the placement point)
foreach ($id in 'trex','pterosaur','ankylosaurus','diplodocus','carnotaurus','raptor','pteranodon','pliosaur') {
  foreach ($v in 'mini','far') {
    & $Blender -b --factory-startup --python "$here\dino_normalize.py" -- --id $id --variant $v --models-root $ModelsRoot --out $Out --scratch $Scratch
  }
}
python -I "$here\make_manifest.py" $ModelsRoot $Out $Scratch
