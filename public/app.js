var count = 0;

// Grab the articles as a json
$.getJSON("/api/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#articles").append(`<button id="save-status" class="button is-medium" data-id=${data[i]._id}>Save Article</button>`);
    $("#articles").append(`<a href=${ data[i].link}>${data[i].title}</a>`);
    $("#articles").append("<p>" + data[i].excerpt +"</p><hr>");
  }
  console.log("data.length of scrape:" +data.length);
  count = data.length;
});

$.getJSON("/api/saved", function(data) {
  for (var i = 0; i < data.length; i++) {
      $("#saved").append(`<a href=${ data[i].link}>${data[i].title}</a>`);
      $("#saved").append(`<button id="save-status" class="button is-medium" data-id=${data[i]._id}>Delete From Saved</button>`);
      $("#saved").append(`<button id="article-notes" class="button is-medium" data-id=${data[i]._id}>Article Notes</button>`);
      $("#saved").append("<p>" + data[i].excerpt +"</p><hr>");
  }
});

// Whenever someone clicks the Article Notes button
$(document).on("click", "#article-notes", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the button
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/api/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/api/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
  console.log("input should be clear if this logs");
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
