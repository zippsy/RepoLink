#Some parameers to use for our internal_link lookup
#(it looks for repository items in the UEL roar IR)
	
my $remote_repos = [	
	{
		repo_uri => 'roar.uel.ac.uk',
		search_script => "/cgi/lookup/title_search"
	},
];


$c->{repo_link} = {
		master => 0, #denotes whether this is a satelite or master repo... 
		min_chars => 5,
		remote_repos => $remote_repos,
		lookup_script => "/users/lookup/repo_link",
#		link_user => "repo_link",
#		link_password => "5353730"
};

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
				input_cols => 60,
			},
    		],

	},
	reuse => 1
);

=comment
#Add the following to cfg/workflow/eprint/default.xml



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
			src => "//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js",
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
}, priority => 2000);
