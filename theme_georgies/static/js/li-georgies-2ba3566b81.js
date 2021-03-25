'use strict';

// Debugging messaging
let debugEnabled = true;
let debugLevel = 'verbose'; // normal or verbose

function debug(level, message) {
  // If debugging is enabled
  if (debugEnabled) {

    // Log nomal messages
    if (level === 'normal') {
      console.log(message);
    }
    // Log verbose messages
    else if (level === 'verbose' && debugLevel === 'verbose') {
      console.log(message);
    }
  } else {
    return;
  }  
}

debug('normal', 'Georgies Custom control code by Lichen initialized...');


// Function for toggling the collapse button's value
function toggleCollapse(event) {
    debug('normal', event.currentTarget);
    let parent = event.currentTarget;
    let control = parent.querySelector('.li-nav-category-main-collapse')
    debug('normal', control);
    if (control) {
        let currentSymbol = control.textContent;
        if (currentSymbol == '+') {
          control.innerHTML = '&mdash;';
        }
        else {
            control.textContent = '+';
        }
    }
}

$('.li-nav-category').on('show.bs.collapse', toggleCollapse);
$('.li-nav-category').on('hide.bs.collapse', toggleCollapse);

// Keep dropdown menus open on click
$(function() {
  $('.dropdown').on({
      "click": function(event) {
        debug('verbose', $(event.target));
        debug('verbose', $(event.target).closest('.dropdown-toggle').length);
        if ($(event.target).closest('.dropdown-toggle').length) {
          $(this).data('closable', true);
        } else {
          $(this).data('closable', false);
        }
      },
      "hide.bs.dropdown": function(event) {
        debug('verbose', 'hide.bs.dropdown triggered');
        let hide = $(this).data('closable');
        $(this).data('closable', true);
        return hide;
      }
  });
});

// TODO: ALASKA, HAWAII and other

// Distributor Map Data
let distributorStates = 
[
  {
    name: ['New York', 'NY'],
    locations: [
      {
        name: 'Bailey Ceramic Supply',
        streetAddress: '62 Tenbroeck Ave',
        cityStateZip: 'Kingston, NY 12402',
        phoneNumbers: [
          '845.339.3721',
          '800.431.6067'
        ],
        online: {
          url: 'www.baileypottery.com',
          https: true
        }
      },
      {
        name: 'The Potter\'s Wheel',
        streetAddress: '12033 83rd Ave',
        cityStateZip: 'Kew Gardens, NY 11415',
        phoneNumbers: ['718.441.6614'],
        online: {
          url: 'www.potterswheelny.com',
          https: true
        }
      }
    ]
  },
  {
    name: ['Washington', 'WA'],
    locations: [
      {
        name: 'The Clay Connection',
        streetAddress: '714 East Sprague',
        cityStateZip: 'Spokane, WA 99202',
        note: '(Carries Georgies clays and glazes)',
        phoneNumbers: ['509.747.6171'],
        online: {
          url: 'www.theclayconnection.org',
          https: true
        }
      }
    ]
  },
  {
    name: ['Oregon', 'OR'],
    locations: [
      {
        name: 'Georgies - Portland (Hey that\'s us!)',
        streetAddress: '756 NE Lombard',
        cityStateZip: 'Portland OR 97211',
        note: '(We carry all our products!)',
        phoneNumbers: [
          '503.283.1253',
          '800.999.CLAY'
        ],
        fax: '503.283.1387',
        online: {
          url: 'www.georgies.com',
          https: true
        }
      },
      {
        name: 'Georgies - Eugene (Hey that\'s us too!)',
        streetAddress: '1471 Railroad Blvd #9',
        cityStateZip: 'Eugene OR 97402',
        note: '(We carry all our products too!)',
        phoneNumbers: [
          '541.338.7654',
          '866.234.CLAY'
        ],
        fax: '541.338.7565',
        online: {
          url: 'www.georgies.com',
          https: true
        }
      },
      {
        name: 'Southern Oregon Pottery Distributors',
        streetAddress: '1134 Suncrest Rd',
        cityStateZip: 'Talent, OR 97540',
        note: '(Carries Georgies clays and glazes)',
        phoneNumbers: [
          '541.535.1311'
        ],
        online: {
          url: 'www.southernoregonclaydistributors.com',
          https: false
        }
      }
    ]
  },
  {
    name: ['Pennsylvania', 'PA'],
    locations: [
      {
        name: 'The Ceramic Shop',
        streetAddress: '3245 Amber St',
        cityStateZip: 'Philadelphia, PA 19134',
        phoneNumbers: ['215.427.9665'],
        online: {
          url: 'www.theceramicshop.com',
          https: true
        }
      }
    ]
  },
  {
    name: ['North Carolina', 'NC'],
    locations: [
      {
        name: 'Fat Cat Pottery Inc',
        streetAddress: '419-C Raleigh St',
        cityStateZip: 'Wilmington, NC 28412',
        phoneNumbers: ['910.395.2529'],
        fax: '910.395.4684',
        online: {
          url: 'www.fatcatpottery.com',
          https: true
        }
      }
    ]
  },
  {
    name: ['Mississippi', 'MS'],
    locations: [
      {
        name: 'Coastal Ceramic Supply & Studio',
        streetAddress: '3418 Bienville Blvd',
        cityStateZip: 'Ocean Springs, MS 39564',
        phoneNumbers: ['228-327-4920'],
        online: {
          email: 'coastalceramicsupply@gmail.com'
        }
      }
    ]
  },
  {
    name: ['Idaho', 'ID'],
    locations: [
      {
        name: 'Mondaes Makerspace and Supply',
        streetAddress: '200 12th Ave South',
        cityStateZip: 'Nampa, ID 83651',
        phoneNumbers: ['208.407.3359'],
        online: {
          url: 'www.mondaes.com',
          https: true
        }
      }
    ]
  },
  {
    name: ['California', 'CA'],
    locations: [
      {
        name: 'Clay People',
        streetAddress: '1430 Potrero Ave',
        cityStateZip: 'Richmond, CA 94804',
        phoneNumbers: [
          '510.236.1492',
          '888.236.1492'
        ],
        online: {
          url: 'www.claypeople.net'
        }
      }
    ]
  }
]

// Distibutor Map Functionality
let mapSelector = '#usa-map';
let stateSelector = '.li-state';
let map = $(mapSelector);
let states = $(mapSelector + ' ' + stateSelector);
debug('verbose', states);
let activeClass = 'li-state-active';
let enabledClass = 'li-state-enabled';
let disabledClass = 'li-state-disabled';

// Get rows of states that match the .li-distributor-state class
let distributorClass = 'li-distributor-state';
let distributorActiveClass = distributorClass + '__active';
let distributorList = $('.' + distributorClass);

// Get the "Selected State:" heading
let selectedStateHeading = $('.li-distributor-state-selected-heading');

let activeState = null;
let selectedState = null ;


debug('verbose', distributorStates);
function colorStates() {
  debug('normal', 'Setting the condition of the states');
  // Check if distributorState data and our access to the states in the svg are both ok
  if (distributorStates && states) {
    // For each state in the svg
    states.each(function(l, state) {
      let matched = false;
      // Check for the matching state in distributorStates and set it enabled if present
      debug('verbose', $(state)[0].id);
      $(distributorStates).each(function(i, disState) {
        if ($(state)[0].id === disState.name[1]) {
          debug('verbose', `Matched ${disState.name[1]}!`);
          $(state).addClass(enabledClass);
          matched = true;
        }
      });
      // Not Matched, removing enabled
      if (!matched) {
        debug('verbose', `${$(state)[0].id} not matched. Removing enabledClass.`);
        $(state).removeClass(enabledClass);
        $(state).addClass(disabledClass);  
      }
    });
  }
}

function selectState () {
  // Get selected state name and set selectedState accordingly
  selectedState = $(this).attr('id');
  debug('normal', `Selected state: ${selectedState}`);
  // Check if selected state is enabled
  if ($(this).hasClass(enabledClass) !== true) {
    // If not true return
    debug('normal', 'Selected a disabled state.');
    return;
  }
  // If activeState is set, check if it's the same as selectedState
  if ( selectedState === activeState) {
    // If true return
    debug('normal', 'Selecting already currently active state.')
    return;
  }
  // If not select the activeState and remove the activeClass class from activeState
  let state = $(mapSelector + ' #' + activeState);
  debug('normal', `Removing activeClass from: ${state.attr('id')}`);
  state.removeClass(activeClass);
  debug('normal', `Removed ${activeClass} from currently active state.`);
  // Move selected state to the top of the svg (append it)
  map.append(this);
  // Add activeClass class to selected selected state
  $(this).addClass(activeClass);
  debug('normal', `Added ${activeClass} to selected state`);
  // Set activeState to selectedState
  activeState = selectedState;
  debug('normal', `ActiveState: ${activeState} selectedState: ${selectedState}`);

  // Check if distibutorList query returned anything
  if (distributorList) {
    // If so, show the rows that match the activeState
    distributorList.each(function (index) {
      debug('verbose', $(this));
      let activeStateClass = distributorClass + '-' + activeState;
      debug('verbose', `activeStateCLass: ${activeStateClass}`);
      // Check if row matches the active state
      if ($(this).hasClass(activeStateClass)) {
        debug('verbose', `State matched, adding ${activeStateClass} now`);
        $(this).addClass(distributorActiveClass);
        // Show the "Selected State" heading
        selectedStateHeading.addClass('li-distributor-state-selected-heading__visible');
      } else {
        debug('verbose', 'State not matched, removing active class');
        $(this).removeClass(distributorActiveClass);
      }
    });

  }

  // Return
  return;
}

// Wait for document to finish loading
$(document).ready(function() {
  colorStates();
  debug('normal', 'Adding distributor map events');
  $(mapSelector + ' g.' + enabledClass).on('click', selectState);
});

// Load static JS odoo templates (used to override any static templates for theming purposes)
odoo.define('theme_georgies.georgies_static_templates', function (require) {
  'use strict';
  var core = require('web.core');
  var ajax = require('web.ajax');
  var qweb = core.qweb;
  ajax.loadXML('/theme_georgies/static/xml/static_templates.xml', qweb);
});