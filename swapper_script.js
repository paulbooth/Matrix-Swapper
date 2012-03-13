/*jslint white: true, browser: true, undef: true, nomen: true, eqeqeq: true, plusplus: false, bitwise: true, regexp: true, strict: true, newcap: true, immed: true, maxerr: 14 */
/*global window: false, REDIPS: true */

/* enable strict mode */
"use strict";

/* Simple element animation */

var	rd = REDIPS.drag,	// reference to the REDIPS.drag library
	redips_init,		// redips initialization
	move,				// moves object to the random position
	enable_button;		// enables/disables button

var num_moved = 0, num_to_move = 0, num_fac = 7, num_rows = 1;

// redips initialization
redips_init = function () {
	rd.init();
	// animation pause (lower values mean the animation plays faster)
	rd.animation_pause = 40;
	// animation step (minimum is 1)
	rd.animation_step = 2;
	rd.drop_option = 'switch'
	// element was dropped - move element in opposite table
	rd.global_source_position = {}

	rd.myhandler_dropped_before = function () {
		var	obj = rd.obj

		// unpack original position and store into variable
		var position = rd.get_position(obj)
		rd.global_source_position.row = position[1]
		rd.global_source_position.col = position[2]

	}

//	rd.myhandler_dropped = function () {
	rd.myhandler_switched = function () {
		// get positional commands from rd object
		var targeted_position = rd.get_position().slice(0,3)
		var original_position = rd.get_position().slice(3)

		num_moved = 0;

		// use positions to get div ids
		var original_obj_id = $(rd.obj).attr("id")
		var targeted_obj_id = $('#drag table tbody tr:nth-child('+ String(original_position[1]+1) +') td:nth-child('+ String(original_position[2]+1) +') div').attr("id")  // this might seem wrong targeting original, but it has already moved, so it is right

		// define selectors
		var targeted_col_selector = '#drag table tbody tr td:nth-child('+ String(targeted_position[2]+1) +') div'
		var original_col_selector = '#drag table tbody tr td:nth-child('+ String(original_position[2]+1) +') div'
		var targeted_row_selector = '#drag table tbody tr:nth-child('+ String(targeted_position[1]+1) +') td div'
		var original_row_selector = '#drag table tbody tr:nth-child('+ String(original_position[1]+1) +') td div'
		
		// swap corners
		var corner1_id = $('#drag table tbody tr:nth-child('+ String(original_position[1]+1) +') td:nth-child('+ String(targeted_position[2]+1) +') div').attr("id") 
		var corner2_id = $('#drag table tbody tr:nth-child('+ String(targeted_position[1]+1) +') td:nth-child('+ String(original_position[2]+1) +') div').attr("id") 

		if ( targeted_position[1] != original_position[1] && targeted_position[2] != original_position[2]){
			rd.move_object({	// move object function
				id:corner1_id,	// move by id
				target: [0, targeted_position[1], original_position[2]],  // [table, row, col]
				callback: move_callback
				//callback: function () {enable_elements(true)} DO YOU NEED TO TURN OFF AN ON SWAPS?
				
			})
		
			rd.move_object({	
				id:corner2_id,	
				target: [0, original_position[1], targeted_position[2]],  // [table, row, col]
				callback: move_callback
			})
		}
		
		var special_cases = [original_obj_id, targeted_obj_id, corner1_id, corner2_id]
		
		// swap original col to target position
		$(original_col_selector).each(function () {
				var cell_id = $(this).attr("id") 	// get id of each cell
				var pos = rd.get_position(cell_id) 	// use id to get position
				if(special_cases.indexOf(cell_id)==-1 ){ // don't move the special cases
					rd.move_object({				// move object function
						id:cell_id,					// move by id
						target: [0, pos[1], targeted_position[2]],  // [table, row, col]
						callback: move_callback
					})
				}
		})
		
		// swap original row to target position
		$(original_row_selector).each(function () {
				var cell_id = $(this).attr("id") 	// get id of each cell				
				var pos = rd.get_position(cell_id) 	// use id to get position
				if(special_cases.indexOf(cell_id)==-1 ){ // don't move the special cases
						rd.move_object({			// move object function
						id:cell_id,					// move by id
						target: [0, targeted_position[1], pos[2]],  // [table, row, col]
						callback: move_callback
					})
				}
		})
		
		// swap target col to original position
		$(targeted_col_selector).each(function () {
				var cell_id = $(this).attr("id") 	// get id of each cell
				var pos = rd.get_position(cell_id) 	// use id to get position
				//alert('id:'+String(cell_id)+' o:'+String(pos)+' t:'+String([0, targeted_position[1], pos[2]]))  
				
				if(special_cases.indexOf(cell_id)==-1 ){ // don't move the special cases
					rd.move_object({				// move object function
						id:cell_id,					// move by id
						target: [0, pos[1], original_position[2]],  // [table, row, col]
						callback: move_callback
					})
				}
		})
		
		
		
		// swap targeted row to original position
		$(targeted_row_selector).each(function () {
				var cell_id = $(this).attr("id") 	// get id of each cell
				var pos = rd.get_position(cell_id) 	// use id to get position
				if(special_cases.indexOf(cell_id)==-1 ){ // don't move the special cases
					rd.move_object({				// move object function
						id:cell_id,					// move by id
						target: [0, original_position[1], pos[2]],  // [table, row, col]
						callback: move_callback
					})
				}
		})
		
		
	};
};

function move_callback() {
	num_moved++;
	//console.log(num_moved);
	var num_expected = (num_fac - 1) * 2 + (num_rows - 1) * 2 - 2;
	if (num_moved == num_expected) {
		recalculate_equality()
	} else if (num_moved > num_expected) {
		console.log("Too many things moved: " + num_moved + " expected no more than: " + num_expected);
	}
}

function recalculate_equality() {
	$('#equality').html('');
	var tbody = $('#body_id')[0];
	num_rows = tbody.children.length;
	num_fac = tbody.children[0].children.length;
	var equality_matrix = [];
	var equality_str = '<table>'
	for (var fac = 0; fac < num_fac; fac++) {
		equality_matrix.push(0);
	}
	for (var row=0; row < num_rows; row++) {
		var child = tbody.children[row];
		for (var col = 0; col < num_fac; col++) {
			var cell = child.children[col];
			var used = parseInt(cell.firstChild.innerHTML);
			equality_matrix[col] = equality_matrix[col] + used;
		}
		var difference = Math.max.apply(null, equality_matrix) - Math.min.apply(null, equality_matrix);
		var class_name = 'rl';
		if (row % 2 == 0) {
			if (difference > 1) {
				class_name = 'rrl';
			} else {
				class_name = 'rl';
			}
		} else {
			if (difference > 1) {
				class_name = 'rrd';
			} else {
				class_name = 'rd';
			}
		}
		equality_str += '<tr class="' + class_name + '">';
		for (var i = 0; i < equality_matrix.length; i++) {
			equality_str += '<td><div class="equality_cell">' + equality_matrix[i] + '</div></td>';
		}
		equality_str += '</tr>';
	}
	equality_str += '</table>';
	$('#equality').append($(equality_str));

};

 function init_swapper(matrix) {
		var tr_string = ""
    	var td_string = ""

		var biplane_16 = matrix
		$('#drag table tbody').html("") // clear current table    	
		var row_counter = 0
		biplane_16.forEach(function(row) {
			var cell_counter = 0
			row_counter++
			if (row_counter % 2 == 0) 	{ tr_string = '<tr class="rl"></tr>'}
    		else	 					{ tr_string = '<tr class="rd"></tr>'}
    		$('#drag table tbody').append(tr_string)
    		row.forEach(function(cell) {
    			cell_counter++
    			td_string = '<td><div id="'+String(row_counter)+'_'+String(cell_counter)+'" '
    			if (cell == 1) {
    				td_string = td_string+'class="drag orange">1</div></td>'
    			} else {
    				td_string = td_string+'class="drag blue">0</div></td>'
    			}
    			$('#drag table tbody tr:last').append(td_string)
    		})
		})

/*
    	for (var i=0;i<=sq;i++){
    		if (i%2==0) { tr_string = '<tr class="rl"></tr>'}
    		else 		{ tr_string = '<tr class="rd"></tr>'}
    		$('#drag table tbody').append(tr_string)

    		for (var j=0;j<=sq;j++){
    			
    			td_string = '<td><div id="'+String(i)+'_'+String(j)+'" class="drag orange">1</div></td>'
				$('#drag table tbody tr:last').append(td_string)
    		}
    	}
*/
	    redips_init()
	    recalculate_equality();

 }
$(document).ready(function()
    {
    	//var mat = get_matrix(7, 3);//[[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],[1,1,0,0,0,0,1,1,1,1,0,0,0,0,0,0],[1,0,1,0,0,0,1,0,0,0,1,1,1,0,0,0],[1,0,0,1,0,0,0,1,0,0,1,0,0,1,1,0],[1,0,0,0,1,0,0,0,1,0,0,1,0,1,0,1],[1,0,0,0,0,1,0,0,0,1,0,0,1,0,1,1],[0,1,1,0,0,0,1,0,0,0,0,0,0,1,1,1],[0,1,0,1,0,0,0,1,0,0,0,1,1,0,0,1],[0,1,0,0,1,0,0,0,1,0,1,0,1,0,1,0],[0,1,0,0,0,1,0,0,0,1,1,1,0,1,0,0],[0,0,1,1,0,0,0,0,1,1,1,0,0,0,0,1],[0,0,1,0,1,0,0,1,0,1,0,1,0,0,1,0],[0,0,1,0,0,1,0,1,1,0,0,0,1,1,0,0],[0,0,0,1,1,0,1,0,0,1,0,0,1,1,0,0],[0,0,0,1,0,1,1,0,1,0,0,1,0,0,1,0],[0,0,0,0,1,1,1,1,0,0,1,0,0,0,0,1]]
		//init_swapper(mat);
		$('#fac_input').change(load_subsets_from_input);
		$('#com_input').change(load_subsets_from_input);
		load_all_subsets(6, 3);
        // The DOM (document object model) is constructed
        // We will initialize and run our plugin here
    })

function load_subsets_from_input() {
	var num_fac = parseInt($('#fac_input').val());
	var num_com = parseInt($('#com_input').val());
	if (num_fac && num_com) {
		load_all_subsets(num_fac, num_com);
	}
}
function load_all_subsets(n,k) {
	init_swapper(get_matrix(n,k))
}

// get all subsets of n faculty (row of length n) with k students (1's)
function get_matrix(n, k) {
	var matrix = [];
	if (k == n) {
		var row = [];
		for (var i = 0; i < n ; i++) {
			row.push(1);
		}
		return [row];
	} else if (k == 1) {
		for (var j = 0; j < n; j++) {
			var row = [];
			for (var i = 0; i < n ; i++) {
				row.push(0);
			}
			row[j] = 1;
			matrix.push(row);
		}
		return matrix
	} else {
		var matrix0 = get_matrix(n-1, k),
			matrix1 = get_matrix(n-1, k-1)
		for (var i = 0; i < matrix1.length; i++) {
			matrix.push([1].concat(matrix1[i]))
		}
		for (var i = 0; i < matrix0.length; i++) {
			matrix.push([0].concat(matrix0[i]))
		}
		return matrix;
	}
}
/**
 * Function moves element to the random position. Generated position must be different then current position.

move = function () {
	var id = 'd1',	// id of drag element
		rowIndex,	// row index (random number from 0 to 6)
		cellIndex,	// cell index (random number from 0 to 6)
		pos;		// current position as array (returned from get_position method)
	// set current position for DIV element with defined id
	pos = rd.get_position(id);
	// generate random position (must be different then current position)
	do {
		rowIndex = Math.floor(Math.random() * 7);	// from 0 to 6
		cellIndex = Math.floor(Math.random() * 7);	// from 0 to 6
	} while (pos[0] === rowIndex && pos[1] === cellIndex);
	// disable "Move" button
	enable_button(false);
	// move object to the random position
	rd.move_object({
		id: id,								// id of object to move
		target: [0, rowIndex, cellIndex],	// target position
		callback: enable_button				// function to call after animation is over
		//callback: move					// try to comment upper line and uncomment this line (refresh page and click on "Move" button)
	});
};

 */
 
/**
 * Function enables/disables button.
 * @param {Boolean} Flag enable or disable buttons.

enable_button = function (flag) {
	var button = document.getElementById('btn_move');
	// input parameter is optional (default value is true)
	if (flag === undefined) {
		flag = true;
	}
	// enable/disable button
	button.disabled = !flag;
};


// add onload event listener
if (window.addEventListener) {
	window.addEventListener('load', redips_init, false);
}
else if (window.attachEvent) {
	window.attachEvent('onload', redips_init);
}
 */