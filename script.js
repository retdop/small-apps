function renderProjects(category) {
  var grid = document.getElementById("projects-grid");
  var filtered =
    category === "all"
      ? PROJECTS
      : PROJECTS.filter(function (p) {
          return p.category === category;
        });

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="empty-state">No projects in this category yet.</p>';
    return;
  }

  grid.innerHTML = filtered
    .map(function (p) {
      var tagsHtml = p.tags
        .map(function (t) {
          return '<span class="tag">' + t + "</span>";
        })
        .join("");

      var linkHtml = p.link
        ? '<a href="' + p.link + '" class="card-link" target="_blank" rel="noopener">View project &rarr;</a>'
        : "";

      return (
        '<article class="card" data-category="' + p.category + '">' +
          '<div class="card-header">' +
            "<h2>" + p.title + "</h2>" +
            '<span class="category-badge ' + p.category + '">' + p.category + "</span>" +
          "</div>" +
          "<p>" + p.description + "</p>" +
          '<div class="tags">' + tagsHtml + "</div>" +
          linkHtml +
        "</article>"
      );
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", function () {
  var tabs = document.querySelectorAll(".tab");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelector(".tab.active").classList.remove("active");
      tab.classList.add("active");
      renderProjects(tab.dataset.category);
    });
  });

  renderProjects("all");
});
