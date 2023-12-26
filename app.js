const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

let username;
let repoOwner;
let repoName;
let accessToken;

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/", (req, res) => {
  username = req.body.username;
  repoOwner = req.body.username;
  repoName = req.body.repoName;
  accessToken = req.body.accessToken;
  res.redirect("/display");
});

// Function to retrieve contribution graph
const getContributionGraph = async () => {
  const query = 
  `query {
      user(login: "${username}") {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }`;

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query }),
  });
  const data = await response.json();
  return data;
};

// Function to retrieve repository image
const getRepositoryImage = async () => {
  const response = await fetch(
    `https://api.github.com/repos/${repoOwner}/${repoName}`,
    {
      method: "GET",
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    }
  );
  const data = await response.json();
  return data.owner.avatar_url;
};

// Express route to display contribution graph and repository image
app.get("/display", async (req, res) => {
  try {
    const contributionGraphData = await getContributionGraph();
    const repoImage = await getRepositoryImage();

    res.render("display", {
      username: username,
      graph: JSON.stringify(contributionGraphData, null, 2),
      repoName: repoName,
      repoImage: repoImage,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Start the Express server
app.listen(port, ()=> {
  console.log(`Server is running at ${port}`);
});

