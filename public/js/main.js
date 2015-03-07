(function () {

	/**
	*
	* Module built to procure navigation from remote endpoint 
	*
	**/
	var navProcurer = (function() {

		var performRequest = function(url) {

			// old school ajax request, also use of native javascript promises (current specification only works on chrome and firefox)
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

	
})();