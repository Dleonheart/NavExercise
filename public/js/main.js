(function () {

	/**
	*
	* Module built to procure navigation from remote endpoint, modules were built using the revealing module pattern 
	*
	**/
	var navProcurer = (function() {

		var performRequest = function(url) {

			// old school ajax request, also use of native javascript promises (current api only works on chrome and firefox)
			var promise = new Promise(function(resolve, reject) {
				var xhr = new XMLHttpRequest();
				xhr.open("GET", url, true);
				xhr.onreadystatechange = function ()
				{
			    	if (xhr.readyState==4 && xhr.status==200)  
			    	{
			            resolve(JSON.parse(xhr.responseText));
			    	}
				}
				xhr.send();
			}); 

			return promise; 
		}

		var getNavigationData = function() {
			return performRequest('api/nav.json');
		}

		/* return of public properties */

		return {
			getNavigationData : getNavigationData
		}
		
	})();


	/**
	*
	* Navigation builder module, takes navigation items and builds specified markup
	*
	**/
	var navigationBuilder = (function() {

		/* private variables definitions, templates are defined as to easily change navigation markup as needed */
		
		var innerNavigationMarkup = '',
			topNavigationItemTemplate = '<li class="topElement"><a href="{{url}}">{{label}}</a>{{secondaryNav}}</li>',
			secondaryNavigationContainerTemplate = '<nav class="secondaryNav"><ul>{{subNavigation}}</ul></nav>',
			secondaryNavigationItemTemplate = '<li class="subElement"><a href="{{url}}">{{label}}</a></li>';

		var buildSecondaryNavigationMarkup = function(items) {

			if(items.length === 0)  return '';

			var navigationMarkup = '';
			items.forEach(function(subNavElement){
				navigationMarkup += secondaryNavigationItemTemplate.replace('{{url}}', subNavElement.url).replace('{{label}}', subNavElement.label) ;
			});

			return secondaryNavigationContainerTemplate.replace('{{subNavigation}}', navigationMarkup);
			
		}

		var buildTopLevelNavElement = function(element) {

			return topNavigationItemTemplate.replace('{{url}}', element.url).replace('{{label}}', element.label).replace('{{secondaryNav}}', buildSecondaryNavigationMarkup(element.items));
		}

		var buildNavigationMarkup = function(navigationData) {

			navigationData.items.forEach(function(element) {

				innerNavigationMarkup += buildTopLevelNavElement(element);
			});

			return innerNavigationMarkup;
		}

		return {
			buildNavigationMarkup: buildNavigationMarkup
		}


	})();


	/**
	*
	* This module deals with user interactions upon the navigation menu and web site
	*
	**/
	var navigationInteractions = (function() {

		/*==========  cache most commonly queried elements  ==========*/

		var menuContainer, mainContent, hamburgerContainer, overlay, logoContainer;

		var cacheElements = function() {
			menuContainer = document.querySelector('.mainNavigationContainer');
		 	mainContent = document.querySelector('.mainContent');
		 	hamburgerContainer = document.querySelector('.hamburgerContainer');
		 	overlay = document.querySelector('.overlay');
		 	logoContainer = document.querySelector('.logoContainer');
		 	
		}
		
		/**
		*
		* toggles the push menu
		*
		**/
		var menuToggle = function(event) {
			event.stopPropagation();
			menuContainer.classList.toggle('pushed');
			hamburgerContainer.classList.toggle('pressed');
			mainContent.classList.toggle('pushed');
			overlay.classList.toggle('showMobile');
			logoContainer.classList.toggle('showMobile');
		}

		/**
		*
		* clears secondary navigation
		*
		**/
		var clearSubNav = function() {
			[].forEach.call(document.querySelectorAll('.secondaryNav'), function (el) {

					 el.classList.remove('visible');
					 el.parentNode.classList.remove('showingSubMenu');
			});
			document.querySelector('.overlay').classList.remove('show');
		}

		/**
		*
		* interaction for when main navigation is clicled
		*
		**/
		var mainNavigationClicked = function(event) {
			
			var element = this.parentNode.querySelector('.secondaryNav'),
				listElement = this.parentNode;

			if(element !== null) {
				//if element doesn't have secondary nav we let the default browser behavior happen and the link be followed
				event.preventDefault();
				event.stopPropagation();
				clearSubNav();
				listElement.classList.add('showingSubMenu');
				element.classList.add('visible');
				document.querySelector('.overlay').classList.add('show');

			}
		}

		var bindEvents = function() {
			//bind click event on main nav items

			//we cache the most commonly used elements
			cacheElements();

			// attach event listeners for all main navigation items
			[].forEach.call(document.querySelectorAll('li.topElement>a'), function (el) {

				 el.addEventListener('click', mainNavigationClicked, false);
			});

			//haburger navigation event handler
			hamburgerContainer.onclick = menuToggle;
			//when overlay is clicked we toggle the menu
			overlay.onclick = menuToggle;
			

			//when any element is clicked secondary navigation is cleared , handler was not attached directly because clearSubNav function is not meant to be a handler as is used in another context
			document.onclick = function(event){
				clearSubNav();
			}
			
		}

		return {
			bindEvents: bindEvents
		}


	})();


	/**
	*
	* kickstarts the menu craetion and interactions binding
	*
	**/
	navProcurer.getNavigationData().then(function(data) {
		var navigationMarkup = navigationBuilder.buildNavigationMarkup(data);
		var mainNavElement = document.querySelector('.mainNavigation ul');
		mainNavElement.innerHTML = navigationMarkup;
		navigationInteractions.bindEvents();
	});


})();