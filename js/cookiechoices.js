/*
 Copyright 2014 Google Inc. All rights reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

(function (window) {

  if (!!window.cookieChoices) {
    return window.cookieChoices;
  }

  var document = window.document;
  // IE8 does not support textContent, so we should fallback to innerText.
  var supportsTextContent = 'textContent' in document.body;

  var cookieChoices = (function () {

    var cookieName = 'displayCookieConsent';
    var cookieConsentId = 'cookieChoiceInfo';
    var dismissLinkId = 'cookieChoiceDismiss';
    var openModaleCookie = 'openModaleCookie';

    function _createHeaderElement(cookieText, dismissText, linkText, linkHref, paramText) {
      var butterBarStyles = 'position:fixed;width:100%;background-color: #D4AD86; color: rgb(27, 26, 26);border-top: 1px solid rgb(245, 239, 239);' +
        'margin:0; left:0; bottom:0; padding:20px;z-index:1000;text-align:center;';

      var cookieConsentElement = document.createElement('div');
      cookieConsentElement.id = cookieConsentId;
      cookieConsentElement.style.cssText = butterBarStyles;
      cookieConsentElement.appendChild(_createConsentText(cookieText));

      if (!!linkText && !!linkHref) {
        cookieConsentElement.appendChild(_createInformationLink(dismissText));

      }
      cookieConsentElement.appendChild(_createDismissLink(linkText, linkHref));
      cookieConsentElement.appendChild(_createParameterLink(paramText));
      return cookieConsentElement;
    }

    function _createDialogElement(cookieText, dismissText, linkText, linkHref, paramText) {
      var glassStyle = 'position:fixed;width:100%;height:100%;z-index:999;' +
        'top:0;left:0;opacity:0.5;filter:alpha(opacity=50);' +
        'background-color:#ccc;';
      var dialogStyle = 'z-index:1000;position:fixed;left:80%;top:50%';
      var contentStyle = 'position:relative;left:-50%;margin-top:-25%;' +
        'background-color:#fff;padding:20px;box-shadow:4px 4px 25px #888;';

      var cookieConsentElement = document.createElement('div');
      cookieConsentElement.id = cookieConsentId;

      var glassPanel = document.createElement('div');
      glassPanel.style.cssText = glassStyle;

      var content = document.createElement('div');
      content.style.cssText = contentStyle;

      var dialog = document.createElement('div');
      dialog.style.cssText = dialogStyle;

      var dismissLink = _createDismissLink(linkText, linkHref);
      dismissLink.style.display = 'block';
      dismissLink.style.textAlign = 'right';
      dismissLink.style.marginTop = '10px';

      content.appendChild(_createConsentText(cookieText));
      if (!!linkText && !!linkHref) {
        content.appendChild(_createInformationLink(dismissText));
      }
      if (!!linkText && !!linkHref) {
        content.appendChild(_createInformationLink(paramText));
      }
      content.appendChild(dismissLink);
      content.appendChild(paramText);
      dialog.appendChild(content);
      cookieConsentElement.appendChild(glassPanel);
      cookieConsentElement.appendChild(dialog);
      return cookieConsentElement;
    }

    function _setElementText(element, text) {
      if (supportsTextContent) {
        element.textContent = text;
      } else {
        element.innerText = text;
      }
    }

    function _createConsentText(cookieText) {
      var consentText = document.createElement('span');
      _setElementText(consentText, cookieText);
      return consentText;
    }

    function _createDismissLink(linkText, linkHref) {
      var infoLink = document.createElement('a');
      _setElementText(infoLink, linkText);
      infoLink.href = linkHref;
      infoLink.target = '_blank';
      infoLink.style.marginLeft = '16px';
      infoLink.style.color = 'rgb(246, 236, 236)';
      return infoLink;
    }

    function _createInformationLink(dismissText) {
      var dismissLink = document.createElement('a');
      _setElementText(dismissLink, dismissText);
      dismissLink.id = dismissLinkId;
      dismissLink.href = '#';
      dismissLink.style.marginLeft = '16px';
      dismissLink.style.color = 'rgb(248, 244, 244)';
      return dismissLink;
    }

    function _createParameterLink(parameterText) {
      var parameterLink = document.createElement('a');
      _setElementText(parameterLink, parameterText);
      parameterLink.id = 'parameterLinkId';
      parameterLink.setAttribute("data-target", "#openModaleCookie");
      parameterLink.setAttribute("data-toggle", "modal");
      parameterLink.href = "#openModaleCookie";
      parameterLink.style.marginLeft = '16px';
      parameterLink.style.color = 'rgb(239, 234, 234)';
      return parameterLink;
    }


    function _dismissLinkClick() {
      saveUserPref();
      removeCookieConsent();
      return false;
    }

    function _showCookieConsent(cookieText, dismissText, linkText, linkHref, isDialog, paramText) {
      if (_shouldDisplayConsent()) {
        removeCookieConsent();
        var consentElement = (isDialog) ?
          _createDialogElement(cookieText, dismissText, linkText, linkHref, '') :
          _createHeaderElement(cookieText, dismissText, linkText, linkHref, paramText);
        var fragment = document.createDocumentFragment();
        fragment.appendChild(consentElement);
        document.body.appendChild(fragment.cloneNode(true));
        document.getElementById(dismissLinkId).onclick = _dismissLinkClick;
      }
    }

    function showCookieConsentBar(cookieText, dismissText, linkText, linkHref, paramText) {
      _showCookieConsent(cookieText, dismissText, linkText, linkHref, false, paramText);
    }

    function showCookieConsentDialog(cookieText, dismissText, linkText, linkHref) {
      _showCookieConsent(cookieText, dismissText, linkText, linkHref, true, '');
    }

    function removeCookieConsent() {
      var cookieChoiceElement = document.getElementById(cookieConsentId);
      if (cookieChoiceElement != null) {
        cookieChoiceElement.parentNode.removeChild(cookieChoiceElement);
      }
    }

    function saveUserPref() {
      // Set the cookie expiry to one month after today.
      var expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      document.cookie = cookieName + '=y; path=/; expires=' + expiryDate.toGMTString();
    }

    function _shouldDisplayConsent() {
      // Display the header only if the cookie has not been set.
      return !document.cookie.match(new RegExp(cookieName + '=([^;]+)'));
    }

    var exports = {};
    exports.showCookieConsentBar = showCookieConsentBar;
    exports.showCookieConsentDialog = showCookieConsentDialog;
    return exports;
  })();

  window.cookieChoices = cookieChoices;
  return cookieChoices;

})(this);
