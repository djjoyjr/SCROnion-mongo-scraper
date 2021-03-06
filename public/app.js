// Grab the articles as a json
$.getJSON("/api/articles", function(data) {
  if (data.length !==0) {
  // For each one
    for (var i = 0; i < data.length; i++) {
      if (data[i].saved == false) {
      // Display the apropos information on the page
      $("#articles").append(`<button id="save-status" class="button is-medium" data-id=${data[i]._id}>Save Article</button>`);
    }
    $("#articles").append(`<a href=${ data[i].link} target="_blank">${data[i].title}</a>`);
    $("#articles").append("<p>" + data[i].excerpt +"</p><hr>");
    }
  }
  else {
    $("#articles").append("<h1> You don't currently have any articles.  Click the Scrape New Articles button above to get started.</h1>");
  };
});

$.getJSON("/api/saved", function(data) {
  for (var i = 0; i < data.length; i++) {
      $("#saved").append(`<button id="save-status" class="button is-medium" data-id=${data[i]._id}>Delete From Saved</button>`);
      $("#saved").append(`<button id="article-notes" class="button is-medium" data-id=${data[i]._id}>Article Notes</button><br>`);
      $("#saved").append(`<a href=${ data[i].link} target="_blank">${data[i].title}</a>`);
      $("#saved").append("<p>" + data[i].excerpt +"</p><hr>");
  }
});

// Whenever someone clicks the Article Notes button
$(document).on("click", "#article-notes", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the button
  var thisId = $(this).attr("data-id");
  // console.log("This is the id it displays: " +thisId);

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/api/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      $("#note-title").append("<h1>" +data.title+ "</h1>");
      if (data.note) {
        for (var i = 0; i < data.note.length; i++) {
          $("#saved-notes").append(`<h2> ${data.note[i].body}  <span><button id="delete-note" class="button is-small" data-id=${data.note[i]._id}>Delete</button></span></h2>`);
        }
      };
      $("#notes").append("<textarea id='bodyinput' name='body' placeholder='Note Body'></textarea>");
      $("#notes").append("<button data-id='" + thisId + "' id='savenote'>Save Note</button>");
    });
});

$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  console.log("this is the id of what's being updated on save note:" + thisId);
  $.ajax({
    method: "POST",
    url: "/api/articles/" + thisId,
    data: {
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      // $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#bodyinput").val("");
  location.reload();
});

// When you click the save-status button
$(document).on("click", "#save-status", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
  console.log("this is the id being passed on button click: " + thisId);
  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/api/saved/" + thisId,
    data: {
      id: thisId
    }
  })
    // With that done
    .done(function(data) {
      location.reload();
      console.log(data);
    });

});

$(document).on("click", "#delete-note", function() {
  var thisId = $(this).attr("data-id");
  $.ajax({
    method: "DELETE",
    url: "/api/articles/" + thisId,
    data: {
      id: thisId
    }
  })
    // With that done
    .done(function(data) {
      location.reload();
      console.log(data);
    });
});
