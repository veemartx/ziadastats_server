# 
$url="http://139.59.92.126:3000/api/db/restore";

$file="Z:\NewDBS\AirportNaivas-PhamaDB_FULL_03272022_144035.BAK.zip";

# $file="Z:\NewDBS\LenanaRd-phAMADB_FULL_03272022_111809.BAK.zip";

# $file="Z:\NewDBS\AthiRiver-PhamaDB_FULL_03272022_083003.BAK.zip";

$Form = @{
    branch      = 'AirportNaivas'
    backup     = Get-Item -Path $file
}

$Result = Invoke-WebRequest -Uri $Url -Method Post -Form $Form

Write-Host $Result;
