$url="http://localhost:3000/api/db/restore";

$file="Z:\CoreBcp\Lenana-testdbbak.zip";

$fileName="Bak";


$fileBin = [System.IO.File]::ReadAlltext($file)
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"
$bodyLines = (
    "--$boundary",
    "Content-Disposition: form-data; name=`"file`"; filename=`"$fileName`"",
    "Content-Type: application/octet-stream$LF",
    $fileBin,
    "--$boundary--$LF"
) -join $LF

Invoke-RestMethod -Uri $url -Method Post -ContentType "multipart/form-data; boundary=`"$boundary`"" -Body $bodyLines