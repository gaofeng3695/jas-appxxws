function creatNumTip(nNow, nTotal,isPlus,isFooter) {


    if (!document.getElementById('numTip')) {
        //var oFrag = document.createDocumentFragment();
        var btm = isFooter? 0.2 : 3.2;
        var sHtml = [
        '<div id="numTip" class="" style="position:fixed;bottom:'+ btm +'em;right:1.1em;height:2.8em;width:2.8em;border-radius:50%;background:rgba(11,11,11,0.4);color:white;text-align:center;line-height:1em;">',
        '<div style="line-height:1.4em;height:1.4em;box-sizing:border-box;border-bottom:1px solid white;margin:0 .4em;"><span id="nNow" class="ulev26">',nNow,'</span></div>', 
        '<div style="height:1.4em;"><span id="nTotal" class="ulev26">',nTotal,'</span></div>',  
            '</div>'
        ].join('');
        //oFrag.innerHTML = sHtml;
        $('body').append(sHtml);    
        //alert(document.getElementById('numTip'));     
    }
    if (+nNow) {
        var now = isPlus?+$('#nNow').html()+nNow : nNow;
        $('#nNow').html(now);
    }
    if (+nTotal) {
        $('#numTip').removeClass('uhide');
        $('#nTotal').html(nTotal);
    }else{
        $('#numTip').addClass('uhide');
    }
}