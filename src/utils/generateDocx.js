const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");

const fs = require("fs");
const path = require("path");

const generateDocx = {
  execute(template, data) {
    const content = fs.readFileSync(
      path.resolve(__dirname, '..', 'reports', template),
      "binary"
    );
    
    const zip = new PizZip(content);
    
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });
    
    doc.render(data);
    
    const buf = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });
    
    fs.writeFileSync(path.resolve(__dirname, "..", "output.docx"), buf);    
  }
}

module.exports = generateDocx