/******** Javascript for master *******/

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



function search_remote_repo(element, url, target, extra_params){
   jQuery(document).ready(function(){
      var el_id = jQuery(element).attr("id");
	//title search only at present
      if(el_id.match(/link_\d+_title/)){
         jQuery(element).on("input",function(){
	    //This needs to be the $c->{repo_link}->{min_chars}, it'll get thrown back by cgi, but need to let it through too?
            if(jQuery(element).val().length>=5){
	    //will hit the proxy cgi with 1 char, but not the remote repo (hence no 1 char search)
  //          if(jQuery(element).val().length){

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
	console.log("HERE");
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

/******** Javascript for satelite *******/

  jQuery(document).ready(function(){  
    if(jQuery("div.repo_links").length > 0 ){
	var this_id = window.location.pathname.replace(/\//g,'');
	    console.log(this_id);

       var url = "/cgi/get_repo_links";

       jQuery.ajax({
         url: url,
         data: {id: this_id},
         dataType: "jsonp", 
                    jsonpCallback: "send_data",
         success: function(data){
           console.log(data);
           if(data.lookup_response.length==0){
             //jQuery(".data_links").html("<p>No data links available for this publication.</p>");
             //or
             //jQuery(".data_links_panel").hide();
           }else{
	    jQuery("div.repo_links").html('<h3>Related items (from other repositories)</h3><ul></ul>');

	     jQuery(data.lookup_response.reverse()).each(function(key, item_data){
			console.log(item_data.title);
			//CRUD.pm problem with item_data.uri probably due to dodgy local host/port set up
			var url = item_data.uri.replace("id/eprint/","");
	       		jQuery("div.repo_links ul").append('<li><a href="'+url+'">'+item_data.title+'</a></li>'); 
	     });
	   }
         },//success
         complete: function(XHR, status) {
           if(console != undefined)
              console.log(status);                  
         },
         fail: function(XHR, status, e){
           alert("FAIL:"+status+" "+e);
         },
       }); //ajax (link_export) 
    }
  });


/*complex mustache rendering for bootstrapped eprints*/
/*
  jQuery(document).ready(function(){  
    if(jQuery("div.data_links_panel").length > 0 ){
      var this_id = jQuery("div.data_links_panel").attr("id").replace("linktodata_from_","");
     var url = "/cgi/export_proxy";

       jQuery.ajax({
         url: url,
         data: {id: this_id},
         dataType: "jsonp", 
                    jsonpCallback: "send_data",
         success: function(data){
           console.log(data);
           if(data.lookup_response.length==0){
             //jQuery(".data_links").html("<p>No data links available for this publication.</p>");
             //or
             //jQuery(".data_links_panel").hide();
           }else{
             jQuery(data.lookup_response.reverse()).each(function(key, value){
               value.type = "data";
               value.key = key;
               value.modal = (window.location != window.parent.location) ? false : true; // don't use modal in iframe
               var template = jQuery("#links-template").html();
               Mustache.parse( template );
               jQuery("#links-accordion").prepend( Mustache.render( template, value ) );
           });
           }
           finalise_links_panel();
         },//success
         complete: function(XHR, status) {
           if(console != undefined)
              console.log(status);                  
           finalise_links_panel();
         },
         fail: function(XHR, status, e){
           alert("FAIL:"+status+" "+e);
           finalise_links_panel();
         },
       }); //ajax (link_export) 
    }
  });

function finalise_links_panel()
{
	var links = jQuery("#links-accordion").find('div.panel-collapse');
	if( links.length === 0 )
	{
		// hide "Links" panel
		jQuery(".data_links_panel").hide();
	}
	else
	{
		// expand first item
		links.first().addClass( "in" );
		if( links.length > 1 )
		{
			jQuery("#summary_links > h2").first().html("Links");
		}
	}
}
*/
