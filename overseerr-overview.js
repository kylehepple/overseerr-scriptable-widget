// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: film;

/**
 * Notes:
 * 1. Add your overseerr URL and API key in the variables below
 * 2. This currently only supports the medium sized widget
 * 3. Feel free to change anything else to suit your needs!
 */

// Update these variables to suit your needs;
const overseerrUrl = '<YOUR OVERSEERR URL HERE>'; // MUST UPDATE;
const apiKey = '<YOUR OVERSEERR API KEY HERE>'; // MUST UPDATE;
const overseerrApiUrl = `${overseerrUrl}/api/v1`;
const widgetTitle = 'Overseerr Overview';
const widgetIcon = 'https://user-images.githubusercontent.com/1066576/125193232-b41d8900-e28e-11eb-801b-3b643f672536.png';
const colors = {
  requestBackground: '#658CBB',
  requestBorder: '#374D67',
  issueBackground: '#D3494E',
  issueBorder: '#75292B',
  updateBackground: '#F0944D',
  updateBorder: '#85512A',
  widgetGradientStart: '#050005',
  widgetGradientEnd: '#200020',
  defaultText: '#FFF'
};
const textSize = 14;
const titleSize = 16;

const widget = new ListWidget();

// Initial setup;
const initialSetup = async function() {

  let startColor = new Color(colors.widgetGradientStart);
  let endColor = new Color(colors.widgetGradientEnd);
  let gradient = new LinearGradient();
  gradient.colors = [startColor, endColor];
  gradient.locations = [0.0, 1];
  widget.backgroundGradient = gradient;

  const stack = widget.addStack();

  const srcImg = await new Request(widgetIcon).loadImage();

  const img = stack.addImage(srcImg);
  img.imageSize = new Size(20,20);

  stack.addSpacer(5);

  const text = stack.addText(widgetTitle);
  text.font = Font.boldRoundedSystemFont(titleSize);
  text.textColor = new Color(colors.defaultText);

  widget.addSpacer(30);

  // Refresh widget every 5 mins;
  const nextRefresh = Date.now() + 1000 * 300;
  widget.refreshAfterDate = new Date(nextRefresh);

}

// Build a tag to add to a stack;
const buildTag = function(stack, text, backgroundColor, borderColor, slim) {

  const tagStack = stack.addStack();
  const tagText = tagStack.addText(text);
  tagText.font = Font.systemFont(textSize);
  tagText.textColor = new Color(colors.defaultText);

  tagStack.borderWidth = 2;
  tagStack.borderColor = new Color(borderColor);
  
  if (slim) {
    tagStack.setPadding(5, 10, 5, 10);
  } else {
    tagStack.setPadding(15, 20, 15, 20);
  }
  tagStack.backgroundColor = new Color(backgroundColor);
  tagStack.cornerRadius = 10;

  return tagText;

}

// Retrieve data from overseerr;
const getOverseerData = async function() {
    
  const countRequest = new Request(`${overseerrApiUrl}/request/count`);
  const issueRequest = new Request(`${overseerrApiUrl}/issue/count`);

  countRequest.method = 'GET';
  countRequest.headers = { 'X-Api-Key': apiKey, 'Content-Type': 'application/json' };

  issueRequest.method = 'GET';
  issueRequest.headers = { 'X-Api-Key': apiKey, 'Content-Type': 'application/json' };
  
  const [counts, issues] = await Promise.all([countRequest.loadJSON(), issueRequest.loadJSON()]);
  const topStack = widget.addStack();

  if (counts.pending > 9999) {
    counts.pending = 9999;
  }

  if (issues.open > 9999) {
    issues.open = 9999;
  }

  const requestText = (counts.pending === 0) ? 'No New Requests' : `${counts.pending} New Request${counts.pending === 1 ? '' : 's'}`;
  const issueText = (issues.open === 0) ? 'No Open Issues' : `${issues.open} Open Issue${issues.open === 1 ? '' : 's'}`;

  const requestTag = buildTag(topStack, requestText, colors.requestBackground, colors.requestBorder);
  requestTag.url = overseerrUrl + '/requests';

  topStack.addSpacer();

  const issuesTag = buildTag(topStack, issueText, colors.issueBackground, colors.issueBorder);
  issuesTag.url = overseerrUrl + '/issues';
    
};

// Setup the footer;
const addFooter = async function() {

  const dt = new Date();
  const stack = widget.addStack();

  const statusRequest = new Request(`${overseerrApiUrl}/status`);
  statusRequest.method = 'GET';
  statusRequest.headers = { 'X-Api-Key': apiKey, 'Content-Type': 'application/json' };

  const status = await statusRequest.loadJSON();

  if (status.updateAvailable) {
    const updateTag = buildTag(stack, 'Update Available', colors.updateBackground, colors.updateBorder, true);
    updateTag.url = overseerrUrl + '/settings/about';
    stack.addSpacer(70);
  } else {
    stack.addSpacer(200);
  }

  const updatedStack = stack.addStack();
  const updatedText = updatedStack.addText(`Last updated: ${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}`);
  
  updatedText.font = Font.systemFont(textSize);
  updatedText.textOpacity = 0.25;
  updatedText.textColor = new Color(colors.defaultText);
  updatedStack.setPadding(5,0,0,0);

}

await initialSetup();
await getOverseerData();

widget.addSpacer(20);

await addFooter();

Script.setWidget(widget);
Script.complete();
widget.presentMedium();
