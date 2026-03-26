document.addEventListener("DOMContentLoaded", function () {
  var grid = document.getElementById("projects-grid");

  grid.innerHTML = PROJECTS.map(function (p) {
    var card =
      '<article class="card">' +
        '<div class="card-header">' +
          "<h2>" + p.title + "</h2>" +
          '<span class="card-date">' + p.date + "</span>" +
        "</div>" +
        "<p>" + p.description + "</p>" +
      "</article>";

    return p.link
      ? '<a href="' + p.link + '" class="card-link" target="_blank" rel="noopener">' + card + "</a>"
      : card;
  }).join("");
});
