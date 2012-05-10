/*!
 *
 * Twet.js
 * A simple jQuery plugin for adding Twitter streams to your website
 * Original author: Derek Wheelden
 * 
 */

;(function ( $, window, document, undefined ) {

	$.fn.twetJs = function( options ) {
		
		if(typeof options === "object") {
				var settings = $.extend( {
					$element  : this,
					query     : '%23twitter',
					limit     : 10,
					blacklist : []
				}, options);
		} else if (typeof options === "string") {
				var settings = {
					$element    : this,
					query      : options,
					limit : 10,
					blacklist  : []
				};
		}
		
		var methods = {
			buildFeedUrl : function () {
				var query = settings.query.replace("#","%23").replace("@", "%40");
				return 'http://search.twitter.com/search.json?q=' + query + '&page=1';
			}
		}

		String.prototype.parseURL = function () {
			return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function (url) {
				var link = '<a href="' + url + '" target="_blank">' + url + '</a>';
				return link;
			});
		};

		String.prototype.parseUsername = function () {
			return this.replace(/[@]+[A-Za-z0-9-_]+/g, function (u) {
				var username = u.replace("@","");
				return u.link("http://twitter.com/"+username);
			});
		};

		String.prototype.parseHashtag = function () {
			return this.replace(/[#]+[A-Za-z0-9-_]+/g, function (t) {
				var tag = t.replace("#","%23");
				var link = '<a href="http://search.twitter.com/search?q=' + tag + '" target="_blank">' + t + '</a>';
				return link;
			});
		};

		return this.each(function() {

			$.ajax({ 
				type: "GET",
				url: methods.buildFeedUrl(),
				dataType: "jsonp",
				success: function (json){
					
					if(!json.results.length) {
						settings.$element.append("<div class=\"twetError\">Woops! We couldn't find any tweets!</div>");
						return false;
					}
					
					var results = json.results,
						count = 1,
						first = results[0].id_str;
					
					$(results).each(function () {
						var tweetProps = {
							timestamp : this.created_at,
							username  : this.from_user,
							avatarUrl : this.profile_image_url,
							tweetId   : this.id_str,
							tweetText : this.text,
							mention   : this.to_user
						};
						
						/* User blacklist. Use sparingly */
						if ($.inArray(tweetProps.username, settings.blacklist) > -1) {
							return true;
						}
						
						var year     = tweetProps.timestamp.substr(12, 4),
							date     = tweetProps.timestamp.substr(5, 2),
							hour     = tweetProps.timestamp.substr(17, 2),
							minute   = tweetProps.timestamp.substr(20,2),
							second   = tweetProps.timestamp.substr(23,2),
							monthtxt = tweetProps.timestamp.substr(8, 3),
							months = {};
							
						months['Jan'] = "01";
						months['Feb'] = "02";
						months['Mar'] = "03";
						months['Apr'] = "04";
						months['May'] = "05";
						months['Jun'] = "06";
						months['Jul'] = "07";
						months['Aug'] = "08";
						months['Sep'] = "09";
						months['Oct'] = "10";
						months['Nov'] = "11";
						months['Dec'] = "12";
						
						var month       = months[monthtxt],
							time        = year + "-" + month + "-" + date + "T" + hour + ":" + minute + ":" + second + "Z",
							relTime     = month + "/" + date + " @ " + hour + ":" + minute,
							parsedTweet = tweetProps.tweetText.parseURL().parseUsername().parseHashtag(),
							stamp       = "<a href=\"https://twitter.com/#!/" + tweetProps.username + "/status/" + tweetProps.tweetId + "\" title=\"" + time + "\">" + relTime + "</a> from @" + tweetProps.username,
							parsedStamp = stamp.parseUsername();

						settings.$element.append("<div class=\"twet clearfix\"><img src=\"" +
							tweetProps.avatarUrl + "\" alt=\"" + tweetProps.username + "\" /><div>" +
							parsedTweet + "<br /><small>" + parsedStamp + "</small></div></div>");
							
						if (count === settings.limit) {
							return false;
						}
						
						count++;
						
					});
					
					/*
					function getnewTwits() {
						setTimeout(function () {
							$.ajax({ 
								type: "GET",
								url: 'http://search.twitter.com/search.json?q=%23slsnow&page=1',
								dataType: "jsonp",
								success: function (json){
									var newResults = json.results;
									var newFirst = newResults[0].id_str;
									if ( newFirst === first ) {
										getnewTwits();
									}
									else { 
										$('#newtweets').show();
										clearTimeout();
									}
								}
							});
						}, 30000);
					}
					
					getnewTwits();
					*/
				}
			});
			
			/*
			$('#newtweets').click(function () {
				$('#newtweets').hide();
				$('#thetweets').empty();
				getTwit();
			});
			*/

		});

  };

})( jQuery, window, document );