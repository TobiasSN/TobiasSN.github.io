const fs = require("fs");
const path = require("path");

const ejs = require("ejs");
const express = require("express");
const { minify: htmlMinify } = require("html-minifier-terser");
const { optimize: svgOptimize } = require("svgo");

const filePath = path.join(__dirname, "index.ejs");
const outDir = path.join(__dirname, "dist");

const ejsData = {
	svg(svgPath) {
		const fullPath = path.join(__dirname, "images", svgPath);
		const contents = fs.readFileSync(fullPath);
		return svgOptimize(contents).data;
		return contents;
	}
}

function dev() {
	

	const app = express();

	app.get("/", (req, res) => {
		res.render(filePath, ejsData);
	});
	
	app.listen(3000, () => {
		console.log("Page is available at http://localhost:3000");
	});
}

async function build() {
	const result = await ejs.renderFile(filePath, ejsData, {
		async: true
	});

	const minified = await htmlMinify(result, {
		removeComments: true,
		collapseWhitespace: true,
		minifyCSS: true
	});

	try {
		fs.statSync(outDir);
	} catch {
		// Output directory doesn't exist.
		fs.mkdirSync(outDir);
	}

	fs.writeFileSync(path.join(outDir, "index.html"), minified);
}

switch (process.argv[2]) {
	case "dev":
		dev();
		break;
	case "build":
		build();
		break;
	default:
		console.error("Please specify either 'dev' or 'build' as an argument.")
		break;
}