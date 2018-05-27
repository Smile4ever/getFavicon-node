'use strict';

const request = require("request");
const cheerio = require("cheerio");
const express = require('express');

function getFaviconUrl(url, callback) {
	let faviconUrl = "";

	let domain = getDomain(url);
	let options = {
		rejectUnauthorized: false, // for Dogpile, see https://stackoverflow.com/questions/20082893/unable-to-verify-leaf-signature
		url: domain,
		method: "GET",
		headers: {
			"Accept": "text/html"
		},
		followAllRedirects: true,
		timeout: 2000
	};
	
	request(options, function(error, response, html) {	
		if (!error && response.statusCode == 200) {
			const $ = cheerio.load(html);
			
			$("link").each(function(i, element) {
				//console.log(element);
				var rel = $(element).attr("rel");
				var mask = $(element).attr("mask");
				if (rel !== undefined && rel.indexOf("icon") > -1 && mask == undefined) {
					faviconUrl = $(element).attr("href");

					return false;
				}
			});

			console.log("faviconUrl is " + faviconUrl);

			// Fixes - Ask.com
			if (faviconUrl === "" && (domain === "http://ask.com" || domain === "https://ask.com")){
				faviconUrl = "https://upload.wikimedia.org/wikipedia/commons/a/a0/AskLogoNew07.PNG";
			}
			// Fixes - Yahoo!
			if (faviconUrl.indexOf(".png") < faviconUrl.lastIndexOf(".png")){
				faviconUrl = faviconUrl.replace(".png", "");
			}
	
			// General
			if (faviconUrl === "" || faviconUrl === undefined){
				request.head({url: domain + "/favicon.ico"}, function(err, resp, body){
					if(resp.statusCode === 200){
						faviconUrl = domain + "/favicon.ico";
						callback({ faviconUrl: faviconUrl });
					}else{
						callback({ status: resp.statusCode });
					}
				});
			}else{
				// Support urls like this: //yastatic.net/iconostasis/_/KKii9ECKxo3QZnchF7ayZhbzOT8.png
				if (faviconUrl.indexOf("//") === 0){
					faviconUrl = "http://" + faviconUrl;
				}else{
					// Support urls like this /icon.png
					let onlyFileName = faviconUrl.indexOf("/") == -1;
					if (faviconUrl.indexOf("/") === 0 || onlyFileName) { // If path returned is relative to root folder
						let responseDomain = getDomain(response.request.uri.href);
						if(onlyFileName){
							responseDomain = responseDomain + "/";
						}
						faviconUrl = responseDomain + faviconUrl;
					}
				}
				
				callback({ faviconUrl: faviconUrl });
			}
		}else{
			if(response){
				callback({ status: response.statusCode });
			}else{
				console.log(error);
				callback({ status: -1 });
			}
		}
	});
}

var app = express();
app.listen(process.env.PORT || 80);

console.log('API started on http://localhost:80/icon?url=');

app.get('/', function(req, res) {
	res.send("Please use /icon as the API path");
});

app.get('/icon', function(req, res) {
	console.log("req.query.url is " + req.query.url);
	if(req.query.url === undefined || req.query.url === ""){
		res.send("Please pass the parameter URL (domain), for example /icon?url=http://duckduckgo.com");
		return;
	}
	getFaviconUrl(req.query.url, function(data){
		if(data.faviconUrl === undefined || data.faviconUrl === ""){
			// Generate fallback?
			res.status(404).send({ error: "No favicon found for " + req.query.url, originStatusCode: data.status });
			return;
		}
		console.log("resolved to " + data.faviconUrl);
		res.redirect(data.faviconUrl);
	});
});

function getDomain(url){
	let protocol = url.split("/")[0] + "//";
	if(url.indexOf("://") == -1){
		protocol = "http://";
	}
	let urlParts = url.replace('http://', '').replace('https://', '').split(/\//);
	
	let domain = protocol + urlParts[0];
	console.log("domain for url " + url + " is " + domain);
	return domain;
}
