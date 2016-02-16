// ==UserScript==
// @name         Instagram List Links
// @namespace    instagram_list_links
// @description  Userscript that lets you back up your instagram media
// @homepageURL  https://github.com/daraeman/instagram_list_links
// @author       daraeman
// @version      1.0
// @date         2016-02-16
// @include      /^https?:\/\/www\.instagram\.com\/.*\/?$/
// @exclude      /^https?:\/\/www\.instagram\.com\/?$/
// @exclude      /^https?:\/\/www\.instagram\.com\/(explore|accounts|emails).*\/?$/
// @downloadURL  https://github.com/daraeman/instagram_list_links/raw/master/instagram_list_links.user.js
// @updateURL    https://github.com/daraeman/instagram_list_links/raw/master/instagram_list_links.meta.js
// ==/UserScript==

function doScroll( scroll_duration ) {
	console.log( "doScroll" );
	scroll_duration = scroll_duration || 500;
	jQuery( "html, body" ).animate({
		scrollTop: ( jQuery( document ).height() - jQuery( window ).height() )
	}, scroll_duration );
}

function scrollToNextPage() {
	console.log( "scrollToNextPage" );
	var scroll_duration = 500;
	doScroll( scroll_duration );
	setTimeout(function(){
		var loop = 0,
			wait = 200;
		var max_loops = ( ( 1000 / wait ) * 60 );
		interval = setInterval(function(){
			loop++;
			if ( loop == max_loops ) {
				console.log( "max loops reached" );
				clearInterval( interval );
				getImages(function( a ) {
					printImages( a );
				});
			}
			else if ( ! isStillLoading() ) {
				console.log( "is not still loading" );
				console.log( "last_document_height >>" );
				console.log( last_document_height );
				console.log( " "+ last_document_height +" = "+ jQuery( document ).height() );
				if ( last_document_height != jQuery( document ).height() ) {
					console.log( "height is different" );
					last_document_height = jQuery( document ).height();
					clearInterval( interval );
					scrollToNextPage();
				}
				else {
					console.log( "height was same" );
					clearInterval( interval );
					getImages(function( a ) {
						printImages( a );
					});
				}
			}
		}, wait );
	}, scroll_duration );
}

function isStillLoading() {
	var check = false;
	jQuery( "a" ).each(function(){
		if ( /Loading more/i.test( jQuery(this).text() ) ) {
			check = true; return false;
		}
	});
	return check;
}

function getImages( callback ) {
	console.log( "getImages" );
	jQuery( "img" ).each(function(){
		console.log( "img" );
		var el = jQuery(this);
		console.log( "el >>" );
		console.log( el );
		var id = el.attr( "id" );
		if ( /^pImage/.test( id ) ) {
			console.log( "image found" );
			var video_check = el.parent().parent().next().find( "span" );
			if ( /video/i.test( video_check.text() ) ) {
				console.log( "image is video" );
				videos.push({
					el: el.parent().parent().parent()
				});
			}
			else {
				console.log( "pushing image" );
				images.push({
					src: el.attr( "src" ),
					text: el.attr( "alt" )
				});
			}
		}
	});

	if ( videos.length ) {
		getVideoLinks(function(){
			printImages();
		});
	}

	
}

function getVideoLinks( callback ) {
	console.log( "getVideoLinks" );
	var videos_left = ( videos.length - 1 );
	var in_view = false;
	var current_video = 0;
	var interval_a = setInterval(function(){
		console.log( "interval_a" );
		if ( ! in_view ) {
			console.log( "not in view" );
			videos[ current_video ].el[0].click();
			in_view = true;
		}
		else {
			console.log( "in view" );
			var button = getCloseButton();
			if ( button.length ) {
				console.log( "close button found" );
				var src = jQuery( "video" ).attr( "src" );
				console.log( "link = "+ src );
				videos[ current_video ].src = src;
				button[0].click();
				in_view = false;
				if ( videos_left === 0 ) {
					clearInterval( interval_a );
					callback();
				}
				videos_left--;
				current_video++;
			}
			else {
				console.log( "close button not found" );
			}
		}
	}, 200 );
}


function printImages() {
	console.log( "printImages" );
	console.log( "images >>" );
	console.log( images );
	console.log( "videos >>" );
	console.log( videos );

	var img_txt = "";
	for ( i = 0; i < images.length; i++ )
		img_txt += images[ i ].src + "\n";

	var vid_txt = "";
	for ( i = 0; i < videos.length; i++ )
		vid_txt += videos[ i ].src + "\n";

	jQuery( "#react-root main" ).append( '<textarea style="width:90%;margin:30px auto;">'+ img_txt +'</textarea><textarea style="width:90%;margin:30px auto;">'+ vid_txt +'</textarea>' );
}

function getCloseButton() {
	var button = false;
	jQuery( "button" ).each(function(){
		if ( /close/i.test( jQuery(this).text() ) ) {
			button = jQuery(this);
			return false;
		}
	});
	return button;
}

function main(){
	var load_more = false;
	jQuery( "a" ).each(function(){ if ( /Load more/i.test( jQuery(this).text() ) ) load_more = jQuery(this); });

	if ( load_more ) {
		last_document_height = jQuery( document ).height();
		load_more[0].click();
		scrollToNextPage();
	}
}

var last_document_height,
	interval,
	images = [],
	videos = [];

var button = jQuery( '<div style="position: absolute; right: 0px; padding: 9px 27px; border: 1px solid rgb( 235,235,235 ); color: rgb( 170,170,170 ); background: rgb( 255,255,255 ); z-index: 1000; cursor: pointer;">List Links</div>' )
				.click(function(){
					main();
				});
jQuery( "nav" ).first().append( button );
button.css( "bottom", -( button.outerHeight() ) + "px" );
