'use strict';

// TODO: ADD SPECIFIC FUNCTIONS ONLY IF THOSE ELEMENTS ARE DETECTED ON THE PAGE. DISTRIBUTOR MAP, IMAGE GALLERIES ETC.

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


// BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS BOOTSTRAP DROPDOWN MENUS
// Keep dropdown menus open on click
function dropDownBS() {
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
}


// IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES IMAGE GALLERIES 
// Check if image gallery is on page
function checkImageGalleries() {
  debug('normal', 'Checking for image galleries...');
  // Get our image galleries
  let image_galleries = document.querySelectorAll('.s_image_gallery');
  if (image_galleries.length) {
    debug('normal', 'Image galleries detected.');
    return image_galleries;
  } else {
    debug('normal', 'No image galleries dectected.');
    return false;
  }
}
// Add medium column size classes dynamically to any detected image gallery snippet (block)
function imageGalleryColumns(image_galleries) {
  // Set our search string to match divs that have a col-lg-* class e.g. col-lg-4
  let columnClassString = 'col-lg-';
  image_galleries.forEach(gallery => {
    // Get columns of the gallery
    let columns = gallery.querySelectorAll(`div[class^='${columnClassString}'], div[class*=' ${columnClassString}']`);
    // Get number of columns
    let numColumns = columns.length;
    debug('verbose', `There are ${numColumns} columns`);
    // Proceed if there are more than two columns
    if (numColumns > 2) {
      columns.forEach(column => {
        // Add a medium column class that sets two columns wide as a gradual stepdown for the image column sizes
        column.classList.add('col-md-6');
        // debug('verbose', column.classList);
      });
    }
  });
}






// DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY DISTRIBUTOR MAP FUNCTIONALITY 

function distributorsToggleMap() {
  // Get the whole distributor map / list section
  let distributorsSection = document.querySelector('.georgies_distributor_locations');
  distributorsSection.classList.toggle('distributorHideMap');

  // Get the column that holds our distributor list
  let distributorListColumn = document.querySelector('.distributorListColumn');
  // Toggle the removal of the col-xl-3 class and add the col-12 class (so that the column fills the whole width of the page)
  distributorListColumn.classList.toggle('col-xl-3');
  distributorListColumn.classList.toggle('col-12');
}

let mapSelector = '#usa-map';
// Check if distibutor map is on the page
function checkDistributorMap() {
  debug('normal', 'Checking for distributor map...');
  let map = document.querySelector(mapSelector);
  if (map) {
    debug('normal', 'Distributor map found.');
    return map;
  } else {
    debug('normal', 'Distributor map not found.');
  }
}


function distMapInit(map) {
  // Add listener for the hide map show list button to toggle the map and show the whole list
  let hideShowButton = document.querySelector('.distributorToggleMapButton');
  hideShowButton.addEventListener('click', distributorsToggleMap);

  debug('normal', 'Distributer map detected on current page.');
  // Distibutor Map Functionality
  let stateSelector = 'georgies-state';
  let states = map.querySelectorAll('.' + stateSelector);
  debug('verbose', 'States detected:');
  debug('verbose', states);
  let activeClass = 'georgies-state-active';
  let enabledClass = 'georgies-state-enabled';
  let disabledClass = 'georgies-state-disabled';

  // Get rows of states that match the .georgies-distributor-state class
  let distributorClass = 'georgies-distributor-state';
  let distributorActiveClass = distributorClass + '__active';
  let distributorStates = document.querySelectorAll('.' + distributorClass);

  let activeState = null;

  function distMapColorStates() {
    debug('normal', 'Setting the condition of the states');
    // Check if distributorState data and our access to the states in the svg are both ok
    if (distributorStates && states) {
      debug('verbose', 'Distributor States:');
      debug('verbose', distributorStates);
      // For each state in the svg
      states.forEach(state => {
        let matched = false;
        // Check for the matching state in distributorList and set it enabled if present
        // debug('verbose', state.id);
        distributorStates.forEach(disState => {
          let disStateID = disState.dataset.state;
          // debug('verbose', `State name: ${disStateID}`)
          if (state.id === disStateID) {
            debug('verbose', `Matched ${disStateID}!`);
            state.classList.add(enabledClass);
            matched = true;
          }
        });
        // Not Matched, removing enabled
        if (!matched) {
          debug('verbose', `${state.id} not matched. Removing enabledClass.`);
          state.classList.remove(enabledClass);
          state.classList.add(disabledClass);  
        }
      });
    }
  }

  function distMapSelectState (event) {
    // Get selected state name and set selectedState accordingly
    // debug('verbose', event.target);
    let selectedState = event.target.closest('.georgies-state');
    debug('verbose', 'Selected state: ');
    debug('verbose', selectedState);
    // // If activeState is set, check if it's the same as selectedState
    if (selectedState === activeState) {
      // If true return
      debug('normal', 'Selecting already currently active state. Doing nothing.')
      return;
    }
    // // If not remove the activeClass class from activeState and set activeState to null
    if (activeState) {
      activeState.classList.remove(activeClass);
      debug('normal', 'Removed activeClass from:');
      debug('normal', activeState);
      activeState = null;
    }
    // // Move selected state to the top of the svg (append it)
    map.append(selectedState);
    // // Add activeClass class to selected selected state
    selectedState.classList.add(activeClass);
    debug('normal', 'Added activeClass to selected state');
    // // Set activeState to selectedState
    activeState = selectedState;
    debug('verbose', 'Active State:');
    debug('verbose', activeState);

    // Get the ID of the active state
    let activeStateID = activeState.id;
    // Get the matching state in the distributor list
    distributorStates.forEach(state => {
      // If active state id matches distributor state id
      if (state.dataset.state === activeStateID) {
        // Add active class to distributor state
        state.classList.add(distributorActiveClass);
        debug('verbose', 'Adding acvite class to matching state distributor list:');
        debug('verbose', state);
      } else {
        // Remove active class from distributor state that no longer is active
        state.classList.remove(distributorActiveClass);
      }
    });
  }

  distMapColorStates();
  debug('normal', 'Adding distributor map events');
  let enabledStates = document.querySelectorAll(mapSelector + ' g.' + enabledClass);
  if (enabledStates) {
    enabledStates.forEach(state => {
      state.addEventListener('click', distMapSelectState);
    });
  }
}


// [1[1]] [2[2]]
// [1[3]]

// [1[[1] <---
// [1[3]] ---^
// [2[3]]

// Footer location masonry
// Single Column Enabled
// Get footer locations
// Check if layout is wide enough for two columns
  // If single column enabled
  // Reorganize columns into two 
// Check if layout is only wide enough for a single column
  // If single column is not enabled
  // Reorganize columns into single column order


// Wait for document to finish loading
$(document).ready(function() {
  debug('normal', 'Georgies Custom control code by Lichen initialized.');

  // Run our boostrap dropdown menu code
  dropDownBS();

  // If image gallery is present, run our column modification code
  let imageGalleries = checkImageGalleries();
  if (imageGalleries) {
    imageGalleryColumns(imageGalleries);
  }

  // If distributor map is present, run our custom code to work with it
  let map = checkDistributorMap();
  if (map) {
    distMapInit(map);
  }
});


// Load static JS odoo templates (used to override any static templates for theming purposes)
odoo.define('theme_georgies.georgies_static_templates', function (require) {
  'use strict';
  var core = require('web.core');
  var ajax = require('web.ajax');
  var qweb = core.qweb;
  ajax.loadXML('/theme_georgies/static/xml/static_templates.xml', qweb);
});