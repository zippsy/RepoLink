#Some parameers to use for our internal_link lookup
#(it looks for repository items in the UEL roar IR)
	
my $remote_repos = [	
	{
		#repo_uri => 'test.ep.devorkin:8081',
		repo_uri => '192.168.171.131:8080',
		search_script => "/cgi/lookup/title_search"
	},
];


$c->{repo_link} = {
		master => 1, #denotes whether this is a satelite or master repo... 
		master_repo_uri => "plug.ep.devorkin",
		min_chars => 5,
		remote_repos => $remote_repos,
		lookup_script => "/users/lookup/repo_link",
		#http://data.uel.ac.uk/cgi/search/archive/advanced/export_ueldr_JSON.js?screen=Search&dataset=archive&_action_export=1&output=JSON&exp=0%7C1%7C-date%2Fcreators_name%2Ftitle%7Carchive%7C-%7Cinternal_link_link%3Ainternal_link_link%3AALL%3AIN%3A[ENCODED_EPRINT_URI FROM_REMOTE]%7C-%7Ceprint_status%3Aeprint_status%3AANY%3AEQ%3Aarchive%7Cmetadata_visibility%3Ametadata_visibility%3AANY%3AEQ%3Ashow
		# eg http%253A%2F%2Froar.uel.ac.uk%2Fid%2Feprint%2F3550
};

#TODO make sure that master has repo_link_link searchable

my $jquery_priority = 20;
if($c->{repo_link}->{master}){
$jquery_priority = 2000;
	$c->add_dataset_field(
		"eprint",
		{
			name   => 'repo_link',
			type   => 'compound',
			multiple=> 1,
			fields => [
				{
					sub_name   => 'title',
					type       => 'text',
					input_cols => 60,

				},
				{
					sub_name => 'link',
					type     => 'url',
					input_cols => 40,
				},
			],

		},
		reuse => 1
	);
}
=comment
# In the MASTER repository - Add the following to cfg/workflow/eprint/default.xml



<component>
	<field ref="repo_link" input_lookup_url="{$config{rel_cgipath}}{$config{repo_link}{lookup_script}}" input_lookup_params="id={eprintid}"/>
</component>

=cut
#NB the is a proxy for running the remote search... *potentially* unneeded if the access-control-allow-origin apache directive is properly configured on remote repo.. though would need a javascript hook for the workflow


#Insert jquery lib ahead of auto.js

$c->add_trigger( EP_TRIGGER_DYNAMIC_TEMPLATE, sub {
	my %params = @_;

	my $repo = $params{repository};
	my $pins = $params{pins};
	my $xhtml = $repo->xhtml;

	my $head = $repo->xml->create_document_fragment;

	# Top
	$head->appendChild( $repo->xml->create_element( "script",
#			src => "//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js",
			src => "/javascript/jquery.min.js", #local jquery
		) );
	$head->appendChild( $repo->xml->create_text_node( "\n    " ) );

	if( defined $pins->{'utf-8.head'} )
	{
		$pins->{'utf-8.head'} .= $xhtml->to_xhtml( $head );
	}
	if( defined $pins->{head} )
	{
		$head->appendChild( $pins->{head} );
		$pins->{head} = $head;
	}
	else
	{
		$pins->{head} = $head;
	}

	return;
}, priority => $jquery_priority);

