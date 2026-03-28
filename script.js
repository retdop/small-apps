document.addEventListener("DOMContentLoaded", function () {
  var grid = document.getElementById("projects-grid");

  grid.innerHTML = PROJECTS.map(function (p) {
    var card =
      '<article class="card">' +
        "<h2>" + p.title + "</h2>" +
        "<p>" + p.description + "</p>" +
      "</article>";

    return p.link
      ? '<a href="' + p.link + '" class="card-link" target="_blank" rel="noopener">' + card + "</a>"
      : card;
  }).join("");
});
