function search_remote_repo(element, url, target, extra_params){
   jQuery(document).ready(function(){
      var el_id = jQuery(element).attr("id");
	//title search only at present
      if(el_id.match(/link_\d+_title/)){
         jQuery(element).on("input",function(){
	    //This needs to be the $c->{repo_link}->{min_chars}, it'll get thrown back by cgi, but need to let it through too?
//            if(jQuery(element).val().length>=5){
	    //will hit the proxy cgi with 1 char, but not the remote repo (hence no 1 char search)
            if(jQuery(element).val().length){

                var w = jQuery(element).width();
                jQuery("#"+target).css({position: "absolute",
                                       offsetTop: jQuery(element).position().top,
                                       width: w + 'px'}).fadeIn();

                jQuery("#"+target+"_loading").css({width: w + 'px'}).fadeIn();
                jQuery(element).attr("autocomplete", "off");
                                jQuery.ajax({
                                        url: url,
				        data: "q="+jQuery(element).val()+extra_params,
				        dataType: "jsonp",
				        jsonpCallback: "send_data",
				        success: function(data, status, XHR) {
					set_link(target,element,data);
				    },
				    complete: function(XHR, status) {
					if(console != undefined) console.log(status);
				    },
				    fail: function(XHR, status, e){
					alert("FAIL:"+status+" "+e);
				    },
				}); //ajax (url)
                        } //if char length
                }); //on input
        } // match id
    }); //doc ready
}

//function to set the foerm values once selected from results
function set_link(target, element, data){

  jQuery("#"+target+"_loading").hide();
  jQuery("#"+target).html("<ul></ul>");

  jQuery(data.lookup_response).each(function(key, value){

        var li = jQuery('<li rel="'+value.uri+'">'+value.title+'</li>');
        jQuery("#"+target+" ul").append(li);
	jQuery(li).click(function(){
		jQuery(element).val(jQuery(this).text());
		var link_id = jQuery(element).attr("id").replace(/title$/, "link");
	      //console.log("link_id: "+link_id);
		var internal_link = jQuery(this).attr("rel");
		jQuery("#"+link_id).val(internal_link);
		jQuery("#"+target).fadeOut();
        }); //click
  }); //each

}

//override ep_autocompleter... maybe
(function() {
    var oldVersion = ep_autocompleter;
    ep_autocompleter = function(element, target, url, basenames, width_of_these, fields_to_send, extra_params) {
        // do some stuff
	if(url.match(/repo_link/)){
                search_remote_repo(element,url, target, extra_params);
                return;

 	}
        var result = oldVersion.apply(this, arguments);
        // do some more stuff
        return result;
    };
})();
