document.addEventListener("DOMContentLoaded", function () {
  var grid = document.getElementById("projects-grid");

  grid.innerHTML = PROJECTS.map(function (p) {
    var tagsHtml = p.tags
      .map(function (t) { return '<span class="tag">' + t + "</span>"; })
      .join("");

    var card =
      '<article class="card">' +
        '<div class="card-header">' +
          "<h2>" + p.title + "</h2>" +
          '<span class="card-date">' + p.date + "</span>" +
        "</div>" +
        "<p>" + p.description + "</p>" +
        '<div class="tags">' + tagsHtml + "</div>" +
      "</article>";

    return p.link
      ? '<a href="' + p.link + '" class="card-link" target="_blank" rel="noopener">' + card + "</a>"
      : card;
  }).join("");
});
