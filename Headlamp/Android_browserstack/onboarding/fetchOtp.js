// Validate required environment variables
if (typeof TO_PHONE_NUMBER === 'undefined' || !TO_PHONE_NUMBER) {
  throw new Error("TO_PHONE_NUMBER environment variable is not set");
}
if (typeof TWILIO_AUTH_TOKEN === 'undefined' || !TWILIO_AUTH_TOKEN) {
  throw new Error("TWILIO_AUTH_TOKEN environment variable is not set");
}
if (typeof TWILIO_ACCOUNT_SID === 'undefined' || !TWILIO_ACCOUNT_SID) {
  throw new Error("TWILIO_ACCOUNT_SID environment variable is not set");
}

// Base64 encoding function
function base64Encode(input) {
  var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var output = "";
  var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
  var i = 0;

  while (i < input.length) {
    chr1 = input.charCodeAt(i++);
    chr2 = input.charCodeAt(i++);
    chr3 = input.charCodeAt(i++);
    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;

    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }

    output += keyStr.charAt(enc1) + keyStr.charAt(enc2) +
              keyStr.charAt(enc3) + keyStr.charAt(enc4);
  }
  return output;
}

// Twilio credentials from env
var accountSid = TWILIO_ACCOUNT_SID;
var authToken = TWILIO_AUTH_TOKEN;

var authString = accountSid + ":" + authToken;
var encodedAuth = base64Encode(authString);
var authHeader = "Basic " + encodedAuth;

// Twilio API request
var url = "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json?To=" + encodeURIComponent(TO_PHONE_NUMBER);

var response = http.get(url, {
  headers: {
    Authorization: authHeader
  }
});

if (!response.ok) {
  throw new Error("Failed to fetch messages: " + response.status);
}

var messages = JSON.parse(response.body).messages;

var otp = null;
for (var i = 0; i < messages.length; i++) {
  var body = messages[i].body;
  var match = body && body.match(/Your Headlamp verification code is: (\d+)/);
  if (match && match[1]) {
    otp = match[1];
    break;
  }
}

if (!otp) {
  throw new Error("OTP not found in any message");
}

// Return the OTP
output.script = output.script || {};
output.script.result = otp;
