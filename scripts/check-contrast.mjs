const pairs = [
 ['Body / ivory','#302d32','#faf7f2',4.5],
 ['Muted text / ivory','#706a70','#faf7f2',4.5],
 ['Primary button','#ffffff','#503e5a',4.5],
 ['Rose heading / ivory','#895047','#faf7f2',4.5],
 ['Recorded day','#7d463e','#efdbd5',4.5],
 ['Estimated day','#80574c','#f9f1ed',4.5],
 ['Input boundary','#998c97','#fffefa',3],
];
function luminance(hex) { const channels=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722; }
for(const [label,foreground,background,min] of pairs){const [a,b]=[luminance(foreground),luminance(background)].sort((a,b)=>b-a);const ratio=(a+.05)/(b+.05);console.log(`${label}: ${ratio.toFixed(2)}:1 (${ratio>=min?'PASS':'FAIL'})`);if(ratio<min)process.exitCode=1;}
