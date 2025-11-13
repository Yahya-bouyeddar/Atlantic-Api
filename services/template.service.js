/**
 * Generate HTML for BON DE COULAGE
 * @param {Object} options - Template options
 * @returns {string} HTML content
 */

const fs = require("fs");
const path = require("path");

// Build the path to the logo
const logoPath = path.join(__dirname, "../public", "logo.jpg");
const fontPath = path.join(__dirname, "../public/fonts", "timesbd.ttf");

// Function to read and encode font to base64
function getFontBase64() {
  try {
    const fontBuffer = fs.readFileSync(fontPath);
    return fontBuffer.toString('base64');
  } catch (err) {
    console.error("Error reading font:", err);
    return null;
  }
}

exports.generateHTMLATT = (options = {}) => {
  const {
    documentType = "ATT",
    company_name_fr = process.env.COMPANY_NAME_FR || "ATLANTIC ETUDES",
    company_name_ar = process.env.COMPANY_NAME_AR || "دراسات الأطلنتيك",
    header_ar_sub = process.env.COMPANY_HEADER_AR_SUB ||
      "شركة الدراسات و التنسيق في البناء و الهندسة المدنية",
    header_fr_sub = process.env.COMPANY_HEADER_FR_SUB ||
      "Société d'Etudes et de Coordination de Bâtiment et Génie Civil",
    header_addr = process.env.COMPANY_ADDR ||
      "Bd Mohamed Bouziane N° 162 Essalama 3 Casablanca",
    logo_base64 = null,
    att_reference = "",
    date = "",
    ville = "Casa",
    reference = "MM/BC/",
    reference_2 = "B/",
    title = "",
    etage = "",
    proprietaire = "SOCIETE ARIF LOGEMENT S.A.R.L. AU.",
    projet = "CONSTRUCTION D'UN IMMEUBLE EN ...",
    adresse = "LOTISSEMENT AL MAMOUNIA LOT N° 3 SIDI HAJJAJ OUED HASSAR. T.F. N° 12231/85.",
    footer_text = process.env.FOOTER_TEXT,
  } = options;
  
  function formatISOToDMY(iso) {
    if (!iso) return "";
    const [y, m, d] = String(iso).split("-");
    if (!y || !m || !d) return iso;
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }

  let nvDate = formatISOToDMY(date);

  // Get font base64
  const fontBase64 = getFontBase64();

  // Generate notes HTML
  let conformiteText = `
    <div class="note-parag-att">
      <p>
        Nous soussigné société <strong>« ATLANTIC ETUDES »</strong><br>
        demeurant à Boulevard Mohamed BOUZIANE N° 162 ESSALAMA III Casablanca.<br>
        Attestons par la présente que les travaux des ouvrages en Béton Armé, armature et dimensions de la construction citée en objet sont conformes au plan de Béton Armé.<br>
        Cette Attestation est délivrée à l'intéressé pour servir et faire valoir ce que de droit.
      </p>
    </div>
  `;

  // Get logo base64
  let base64Image = null;
  try {
    const data = fs.readFileSync(logoPath);
    base64Image = `data:image/jpeg;base64,${data.toString("base64")}`;
  } catch (err) {
    console.error("Error reading logo:", err);
  }

  const logoHtml = base64Image ? `<img src="${base64Image}" alt="Logo"/>` : "";

  // Build font-face CSS
  const fontFaceCSS = fontBase64 ? `
    @font-face {
      font-family: 'timesbd';
      font-style: normal;
      font-weight: 400;
      src: url(data:font/truetype;charset=utf-8;base64,${fontBase64}) format('truetype');
      font-display: block;
    }
  ` : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        ${fontFaceCSS}
                
        @page {
            size: A4;
            margin: 5px 10px 5px 10px;
        }
        * {
            margin: 5px 10px 5px 10px;
            padding: 0;
            box-sizing: border-box;
            font-family: 'timesbd', 'Arial', sans-serif !important;
        }
         body {
            font-family: 'timesbd', 'Arial', sans-serif !important;
            font-size: 20.5pt;
            line-height: 1.2;
            margin:0;
            color: #000;
            padding: 0;
            position: relative;
        }
        
        /* Background watermark */
        body::before {
            content: '';
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 60%;
            height: 60%;
            background-image: url('${base64Image}');
            background-repeat: no-repeat;
            background-position: center center;
            background-size: contain;
            opacity: 0.08;
            z-index: -1;
            pointer-events: none;
        }

        /* HEADER with UNDERLINE only under company names and logo */
        .header {
            margin-bottom: 2mm;
            position: relative;
            margin-left:0px;
            margin-right:0px;
            z-index: 1;
        }

        .header-top {
            display: flex;
            align-items: flex-start;
            margin-left:0px;
            margin-right:0px;
        }

        .logo {
            width: 30mm;
            margin:0px;
            flex-shrink: 0;
            margin-top=5px;
        }

        .logo img {
            width: 100%;
            height: auto;
        }

        .header-text {
            padding-top:20px;
            flex: 1;
        }

        .company-names {
            border-bottom: 1px solid #000;
            text-align: center;
            margin-bottom: 1mm;
            white-space: nowrap;
        }

        .name-fr {
            font-size: 25pt;
            font-weight: bold;
            display: inline-block;
            font-family: 'timesbd', 'Arial', sans-serif !important;
        }

        .name-ar {
            font-size: 25pt;
            font-weight: bold;
            direction: rtl;
            display: inline-block;
            margin-left: 50mm;
            font-family: 'timesbd', 'Arial', sans-serif !important;
        }

        .header-info {
            margin-top:2px;
            font-size: 45px;
            text-align: center;
        }

        .subtitle-ar {
            font-size: 21pt;
            direction: rtl;
            margin: 1mm 0;
        }

        .subtitle-fr {
            font-size: 15pt;
            margin: 1mm 0;
        }

        .address {
            font-size: 15pt;
        }

        /* Meta */
        .meta {
            margin: 8mm 0;
            position: relative;
            z-index: 1;
            padding:0px 50px;
        }

        .date {
            text-align: right;
            font-size: 18pt;
            margin-bottom: 0mm;
            padding-top:20px;
        }

        .reference {
            font-size: 18pt;
            line-height: 1.1;
        }

        /* Title */
        .title {
            text-align: center;
            font-size: 19pt;
            font-weight: bold;
            text-decoration: underline;
            letter-spacing: 0.5px;
            margin: 10mm 0 10mm 0;
            position: relative;
            z-index: 1;
        }

        .subtitle {
            text-align: center;
            font-size: 15pt;
            font-weight: bold;
            text-decoration: underline;
            margin: 2mm 0 10mm 0;
            position: relative;
            z-index: 1;
        }

        /* Project info with aligned colons */
        .info {
            margin: 8mm 0;
            font-size: 10pt;
            line-height: 1.5;
            position: relative;
            z-index: 1;
            padding:0px 40px;
        }

        .info-row {
            display: flex;
            margin-bottom: 4mm;
            align-items: flex-start;
        }

        .info-label {
            display:flex;
            justify-content:space-between;
            font-weight: bold;
            width: 23vw;
            text-align: right;
            flex-shrink: 0;
            font-size:20px;
        }

        .info-colon {
            margin: 0 2mm;
            flex-shrink: 0;
        }

        .info-content {
            font-size:20px;
            flex: 1;
            max-width:50vw;
        }

        /* Authorization */
        .auth {
            text-align: center;
            font-size: 13pt;
            line-height: 1.4;
            margin: 12mm 0 8mm 0;
            position: relative;
            z-index: 1;
        }

        /* Notes - CENTERED with blue box */
        .notes-container {
            display: flex;
            justify-content: center;
            margin: 0mm 10mm 10mm 10mm;
            position: relative;
            z-index: 1;
        }

        .notes-box {
            display: inline-block;
            text-align: left;
        }

        .nb-title {
            font-weight: bold;
            text-decoration: underline;
            font-size: 16px;
            margin-bottom: 3mm;
        }

        .note-item {
            font-size: 11.5pt;
            line-height: 1.4;
            margin: 10px;
        }

        /* Stamp */
        .stamp {
            text-align: center;
            margin: 12mm 0 15mm 0;
            position: relative;
            z-index: 1;
        }

        .stamp-line1 {
            font-size: 12pt;
            font-weight: bold;
            color: #cc0000;
            letter-spacing: 1px;
            margin: 0.5mm 0;
        }

        .stamp-line2 {
            font-size: 10pt;
            color: #cc0000;
            direction: rtl;
            margin: 0.5mm 0;
        }

        .stamp-line3 {
            font-size: 8.5pt;
            color: #cc0000;
            margin: 0.5mm 0;
        }

        .stamp-line4 {
            font-size: 7.5pt;
            color: #cc0000;
            direction: rtl;
            margin: 0.5mm 0;
        }

        /* Footer */
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 13px;
            color: #666;
            padding: 5mm 0;
            border-top: 0.5pt solid #999;
            background: white;
            z-index: 2;
        }
        .note-parag-att{
            font-size:22px;
            width:60%;
            margin:30px auto;
        }
        .note-parag-att p {
            padding-top:30px;
        }

        @media print {
            .footer {
                position: fixed;
                bottom: 0;
            }
            
            body::before {
                position: fixed;
            }
        }
    </style>
</head>
<body>

    <!-- HEADER -->
    <div class="header">
        <div class="header-top">
            <div class="logo">
                ${logoHtml}
            </div>
            <div class="header-text">
                <div class="company-names">
                    <span class="name-fr">${company_name_fr}</span>
                    <span class="name-ar">${company_name_ar}</span>
                </div>
                <div class="header-info">
                    <div class="subtitle-ar">${header_ar_sub}</div>
                    <div class="subtitle-fr">${header_fr_sub}</div>
                    <div class="address">${header_addr}</div>
                </div>
            </div>
        </div>
    </div>

    <!-- META -->
    <div class="meta">
        <div class="date">${ville}, le ${nvDate}</div>
        <div class="reference">N/Réf : MM/ATT/${att_reference}<br/>B/${reference_2}</div>
    </div>

    <!-- TITLE -->
    <div class="title">ATTESTATION <br/> DE CONFORMITE</div>

    <!-- INFO -->
    <div class="info">
        <div class="info-row">
            <div class="info-label"><span>PROPRIETAIRE</span><span>:</span></div>
            <div class="info-content">
                ${proprietaire}
            </div>
        </div>
        
        <div class="info-row">
            <div class="info-label"><span>PROJET</span><span>:</span></div>
            <div class="info-content">${projet}</div>
        </div>
        
        <div class="info-row">
            <div class="info-label"><span>ADRESSE</span><span>:</span></div>
            <div class="info-content">${adresse}</div>
        </div>
    </div>

    <!-- NOTES -->
    ${conformiteText}
    
    <!-- FOOTER -->
    <div class="footer">
        ${footer_text || "MARRAKECH BUREAU D'ETUDE TECHNIQUES Tel : 0661175125 / 0662638225"}
    </div>

</body>
</html>`;
};

// exports.generateHTMLATT = (options = {}) => {
//   const {
//     documentType = "ATT",
//     company_name_fr = process.env.COMPANY_NAME_FR || "ATLANTIC ETUDES",
//     company_name_ar = process.env.COMPANY_NAME_AR || "دراسات الأطلنتيك",
//     header_ar_sub = process.env.COMPANY_HEADER_AR_SUB ||
//       "شركة الدراسات و التنسيق في البناء و الهندسة المدنية",
//     header_fr_sub = process.env.COMPANY_HEADER_FR_SUB ||
//       "Société d'Etudes et de Coordination de Bâtiment et Génie Civil",
//     header_addr = process.env.COMPANY_ADDR ||
//       "Bd Mohamed Bouziane N° 162 Essalama 3 Casablanca",
//     logo_base64 = null,
//     att_reference = "",
//     date = "",
//     ville = "Casa",
//     reference = "MM/BC/",
//     reference_2 = "B/",
//     title = "",
//     etage = "",
//     proprietaire = "SOCIETE ARIF LOGEMENT S.A.R.L. AU.",
//     projet = "CONSTRUCTION D'UN IMMEUBLE EN ...",
//     adresse = "LOTISSEMENT AL MAMOUNIA LOT N° 3 SIDI HAJJAJ OUED HASSAR. T.F. N° 12231/85.",
//     footer_text = process.env.FOOTER_TEXT,
//   } = options;
//   function formatISOToDMY(iso) {
//     if (!iso) return "";
//     const [y, m, d] = String(iso).split("-");
//     if (!y || !m || !d) return iso; // si format inattendu, on renvoie tel quel
//     return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
//   }

//   let nvDate = formatISOToDMY(date);

//   // Generate notes HTML - CENTERED with blue box
//   let conformiteText = `
//                     <div class = "note-parag-att">
//                          <p>
//                             Nous soussigné société <strong>« ATLANTIC ETUDES »</strong><br>
//                             demeurant à Boulevard Mohamed BOUZIANE N° 162 ESSALAMA III Casablanca.<br>
//                             Attestons par la présente que les travaux des ouvrages en Béton Armé, armature et dimensions de la construction citée en objet sont conformes au plan de Béton Armé.<br>
//                             Cette Attestation est délivrée à l’intéressé pour servir et faire valoir ce que de droit.
//                          </p>
//                      </div>
               
            
//         `;

//   let base64Image = null;
//   try {
//     const data = fs.readFileSync(logoPath); // synchronous
//     base64Image = `data:image/jpeg;base64,${data.toString("base64")}`;
//   } catch (err) {
//     console.error("Error reading logo:", err);
//   }

//   // Logo HTML
//   const logoHtml = base64Image ? `<img src="${base64Image}" alt="Logo"/>` : "";

//   return `<!DOCTYPE html>
// <html lang="fr">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>${title}</title>
//     <style>
       
//         @font-face {
//             font-family: 'timesbd';
//             font-style: normal;
//             font-weight: 400;
//             src: url('https://atlantic-api-1.onrender.com/fonts/timesbd-Regular.ttf') format('truetype');
//             font-display: block;
//         }
                
//         @page {
//             size: A4;
//             margin: 5px 10px 5px 10px;
//         }
//         * {
//             margin: 5px 10px 5px 10px;
//             padding: 0;
//             box-sizing: border-box;
//             font-family: 'timesbd', cursive !important;
//         }
//          body {
//             font-family: 'timesbd', cursive !important;
//             font-size: 20.5pt;
//             line-height: 1.2;
//             margin:0;
//             color: #000;
//             padding: 0;
//             position: relative;
//         }
        
//         /* Background watermark */
//         body::before {
//             content: '';
//             position: fixed;
//             top: 50%;
//             left: 50%;
//             transform: translate(-50%, -50%);
//             width: 60%;
//             height: 60%;
//             background-image: url('${base64Image}');
//             background-repeat: no-repeat;
//             background-position: center center;
//             background-size: contain;
//             opacity: 0.08;
//             z-index: -1;
//             pointer-events: none;
//         }

//         /* HEADER with UNDERLINE only under company names and logo */
//         .header {
//             margin-bottom: 2mm;
//             position: relative;
//             margin-left:0px;
//             margin-right:0px;
//             z-index: 1;
//         }

//         .header-top {
//             display: flex;
//             align-items: flex-start;
//             margin-left:0px;
//             margin-right:0px;
//         }

//         .logo {
            
//             width: 30mm;
//             margin:0px;
//             flex-shrink: 0;
//             margin-top=5px;
//         }

//         .logo img {
//             width: 100%;
//             height: auto;
//         }

//         .header-text {
//             font-family: 'timesbd', cursive !important;
//             padding-top:20px;
//             flex: 1;
            
//         }

//         .company-names {
//             border-bottom: 1px solid #000;
//             text-align: center;
//             margin-bottom: 1mm;
//             white-space: nowrap;
//         }

//         .name-fr {
//             font-size: 25pt;
//             font-weight: bold;
//             display: inline-block;
//              font-family: 'timesbd', cursive !important;

//         }

//         .name-ar {
//             font-size: 25pt;
//             font-weight: bold;
//             direction: rtl;
//             display: inline-block;
//             margin-left: 50mm;
//             font-family: 'timesbd', cursive !important;

//         }

//         .header-info {
//             margin-top:2px;
//             font-size: 45px;
//             text-align: center;
//         }

//         .subtitle-ar {
//             font-size: 21pt;
//             direction: rtl;
//             margin: 1mm 0;
//         }

//         .subtitle-fr {
//             font-size: 15pt;
//             margin: 1mm 0;
//         }

//         .address {
//             font-size: 15pt;
//         }

//         /* Meta */
//         .meta {
//             margin: 8mm 0;
//             position: relative;
//             z-index: 1;
//             padding:0px 50px;
            
//         }

//         .date {
//             text-align: right;
//             font-size: 18pt;
//             margin-bottom: 0mm;
//             padding-top:20px;
//         }

//         .reference {
//             font-size: 18pt;
//             line-height: 1.1;
//         }

//         /* Title */
//         .title {
//             text-align: center;
//             font-size: 19pt;
//             font-weight: bold;
//             text-decoration: underline;
//             letter-spacing: 0.5px;
//             margin: 10mm 0 10mm 0;
//             position: relative;
//             z-index: 1;
//         }

//         .subtitle {
//             text-align: center;
//             font-size: 15pt;
//             font-weight: bold;
//             text-decoration: underline;
//             margin: 2mm 0 10mm 0;
//             position: relative;
//             z-index: 1;
//         }

//         /* Project info with aligned colons */
//         .info {
//             margin: 8mm 0;
//             font-size: 10pt;
//             line-height: 1.5;
//             position: relative;
//             z-index: 1;
//             padding:0px 40px;
//         }

//         .info-row {
//             display: flex;
//             margin-bottom: 4mm;
//             align-items: flex-start;
//         }

//         .info-label {
//             display:flex;
//             justify-content:space-between;
//             font-weight: bold;
//             width: 23vw;
//             text-align: right;
//             flex-shrink: 0;
//             font-size:20px;
//         }

//         .info-colon {
//             margin: 0 2mm;
//             flex-shrink: 0;
//         }

//         .info-content {
//             font-size:20px;
//             flex: 1;
//             max-width:50vw;
//         }

//         /* Authorization */
//         .auth {
//             text-align: center;
//             font-size: 13pt;
//             line-height: 1.4;
//             margin: 12mm 0 8mm 0;
//             position: relative;
//             z-index: 1;
//         }

//         /* Notes - CENTERED with blue box */
//         .notes-container {
//             display: flex;
//             justify-content: center;
//             margin: 0mm 10mm 10mm 10mm;
//             position: relative;
//             z-index: 1;
//         }

//         .notes-box {
//             display: inline-block;
//             text-align: left;
//         }

//         .nb-title {
//             font-weight: bold;
//             text-decoration: underline;
//             font-size: 16px;
//             margin-bottom: 3mm;
//         }

//         .note-item {
//             font-size: 11.5pt;
//             line-height: 1.4;
//             margin: 10px;
//         }

//         /* Stamp */
//         .stamp {
//             text-align: center;
//             margin: 12mm 0 15mm 0;
//             position: relative;
//             z-index: 1;
//         }

//         .stamp-line1 {
//             font-size: 12pt;
//             font-weight: bold;
//             color: #cc0000;
//             letter-spacing: 1px;
//             margin: 0.5mm 0;
//         }

//         .stamp-line2 {
//             font-size: 10pt;
//             color: #cc0000;
//             direction: rtl;
//             margin: 0.5mm 0;
//         }

//         .stamp-line3 {
//             font-size: 8.5pt;
//             color: #cc0000;
//             margin: 0.5mm 0;
//         }

//         .stamp-line4 {
//             font-size: 7.5pt;
//             color: #cc0000;
//             direction: rtl;
//             margin: 0.5mm 0;
//         }

//         /* Footer */
//         .footer {
//             position: fixed;
//             bottom: 0;
//             left: 0;
//             right: 0;
//             text-align: center;
//             font-size: 13px;
//             color: #666;
//             padding: 5mm 0;
//             border-top: 0.5pt solid #999;
//             background: white;
//             z-index: 2;
//         }
//         .note-parag-att{
//         font-size:22px;
//         width:60%;
//         margin:30px auto;
//         }
//         .note-parag-att p {
//             padding-top:30px;
//         }
        

//         @media print {
//             .footer {
//                 position: fixed;
//                 bottom: 0;
//             }
            
//             body::before {
//                 position: fixed;
//             }
//         }
//     </style>
// </head>
// <body>

//     <!-- HEADER -->
//     <div class="header">
//         <div class="header-top">
//             <div class="logo">
//                 ${logoHtml}
//             </div>
//             <div class="header-text">
//                 <div class="company-names">
//                     <span class="name-fr">${company_name_fr}</span>
//                     <span class="name-ar">${company_name_ar}</span>
//                 </div>
//                 <div class="header-info">
//                     <div class="subtitle-ar">${header_ar_sub}</div>
//                     <div class="subtitle-fr">${header_fr_sub}</div>
//                     <div class="address">${header_addr}</div>
//                 </div>
//             </div>
//         </div>
        
//     </div>

//     <!-- META -->
//     <div class="meta">
//         <div class="date">${ville}, le ${nvDate}</div>
//         <div class="reference">N/Réf : MM/ATT/${att_reference}<br/>B/${reference_2}</div>
//     </div>

//     <!-- TITLE -->
//     <div class="title">ATTESTATION <br/> DE CONFORMITE</div>

//     <!-- INFO -->
//     <div class="info">
//         <div class="info-row">
//             <div class="info-label"><span>PROPRIETAIRE</span><span>:</span></div>
//             <div class="info-content">
//                 ${proprietaire}
//             </div>
//         </div>
        
//         <div class="info-row">
//             <div class="info-label"><span>PROJET</span><span>:</span></div>
//             <div class="info-content">${projet}</div>
//         </div>
        
//         <div class="info-row">
//             <div class="info-label"><span>ADRESSE</span><span>:</span></div>
//             <div class="info-content">${adresse}</div>
//         </div>
//     </div>

//     <!-- AUTHORIZATION -->
   

//     <!-- NOTES -->
//     ${conformiteText}
//     <!-- FOOTER -->
//     <div class="footer">
//         ${footer_text || "MARRAKECH BUREAU D'ETUDE TECHNIQUES Tel : 0661175125 / 0662638225"}
//     </div>

// </body>
// </html>`;
// };

// exports.generateHTMLBCLG = (options = {}) => {
//   const {
//     documentType = "BCLG",
//     company_name_fr = process.env.COMPANY_NAME_FR || "ATLANTIC ETUDES",
//     company_name_ar = process.env.COMPANY_NAME_AR || "دراسات الأطلنتيك",
//     header_ar_sub = process.env.COMPANY_HEADER_AR_SUB ||
//       "شركة الدراسات و التنسيق في البناء و الهندسة المدنية",
//     header_fr_sub = process.env.COMPANY_HEADER_FR_SUB ||
//       "Société d'Etudes et de Coordination de Bâtiment et Génie Civil",
//     header_addr = process.env.COMPANY_ADDR ||
//       "Bd Mohamed Bouziane N° 162 Essalama 3 Casablanca",
//     logo_base64 = null,
//     date = "",
//     ville = "Casa",
//     reference = "MM/BC/",
//     reference_2 = "B/",
//     title = "BON DE COULAGE",
//     etage = "PL.HT. S/SOL",
//     proprietaire = "SOCIETE ARIF LOGEMENT S.A.R.L. AU.",
//     projet = "CONSTRUCTION D'UN IMMEUBLE EN S/SOL + R.D.CH. + SOUPENTE + 3 ETAGES.",
//     adresse = "LOTISSEMENT AL MAMOUNIA LOT N° 3 SIDI HAJJAJ OUED HASSAR. T.F. N° 12231/85.",
//     footer_text = process.env.FOOTER_TEXT,
//   } = options;
  
//   console.log("options", etage);
//   let show_notes = true;

//   // Generate authorization text
//   const authText = generateAuthorizationText(etage);
//   if (etage === "FONDATIONS" || etage === "DALLAGE") {
//     show_notes = false;
//   }
//   // Generate notes HTML - CENTERED with blue box
//   let notesHtml = "";
//   if (show_notes) {
//     const notesList = [
//       "Augmenter le nombre d'étai.",
//       "Bien caler les fonds de poutres",
//       "Mettre les calles sur les poutres.",
//     ];
//     const notesItems = notesList
//       .map((note) => `<div class="note-item">* ${note}</div>`)
//       .join("\n");

//     notesHtml = `
//         <div class="notes-container">
//             <div class="notes-box">
//                 <div class="nb-title">N.B :</div>
//                 ${notesItems}
//             </div>
//         </div>
//         `;
//   }

//   let base64Image = null;
//   try {
//     const data = fs.readFileSync(logoPath); // synchronous
//     base64Image = `data:image/jpeg;base64,${data.toString("base64")}`;
//   } catch (err) {
//     console.error("Error reading logo:", err);
//   }

//   // Logo HTML
//   const logoHtml = base64Image ? `<img src="${base64Image}" alt="Logo"/>` : "";

//   return `<!DOCTYPE html>
// <html lang="fr">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <link href="https://fonts.cdnfonts.com/css/times-new-roman" rel="stylesheet">
//     <title>${title}</title>
//     <style>
//         @import url('https://fonts.cdnfonts.com/css/times-new-roman');
//         @page {
//             size: A4;
//             margin: 5px 10px 5px 10px;
//         }

//         * {
//             margin: 5px 10px 5px 10px;
//             padding: 0;
//             box-sizing: border-box;
//             font-family: 'Times New Roman', Times, serif !important;
//         }

//         body {
//             font-family: 'Times New Roman', Times, serif !important;
//             font-size: 20.5pt;
//             line-height: 1.2;
//             margin:0;
//             color: #000;
//             padding: 0;
//             position: relative;
//         }
        
//         /* Background watermark */
//         body::before {
//             content: '';
//             position: fixed;
//             top: 50%;
//             left: 50%;
//             transform: translate(-50%, -50%);
//             width: 60%;
//             height: 60%;
//             background-image: url('${base64Image}');
//             background-repeat: no-repeat;
//             background-position: center center;
//             background-size: contain;
//             opacity: 0.08;
//             z-index: -1;
//             pointer-events: none;
//         }

//         /* HEADER with UNDERLINE only under company names and logo */
//         .header {
//             margin-bottom: 2mm;
//             position: relative;
//             margin-left:0px;
//             margin-right:0px;
//             z-index: 1;
//         }

//         .header-top {
//             display: flex;
//             align-items: flex-start;
//             margin-left:0px;
//             margin-right:0px;
            
//         }

//         .logo {
            
//             width: 30mm;
//             margin:0px;
//             flex-shrink: 0;
//             margin-top=5px;
//         }

//         .logo img {
//             width: 100%;
//             height: auto;
//         }

//         .header-text {
//             padding-top:20px;
//             flex: 1;
            
//         }

//         .company-names {
//             border-bottom: 1px solid #000;
//             text-align: center;
//             margin-bottom: 1mm;
//             white-space: nowrap;
//         }

//         .name-fr {
//             font-size: 25pt;
//             font-weight: bold;
//             display: inline-block;
//         }

//         .name-ar {
//             font-size: 25pt;
//             font-weight: bold;
//             direction: rtl;
//             display: inline-block;
//             margin-left: 50mm;
//         }

//         .header-info {
//             margin-top:2px;
//             font-size: 45px;
//             text-align: center;
//         }

//         .subtitle-ar {
//             font-size: 21pt;
//             direction: rtl;
//             margin: 1mm 0;
//         }

//         .subtitle-fr {
//             font-size: 15pt;
//             margin: 1mm 0;
//         }

//         .address {
//             font-size: 15pt;
//         }

//         /* Meta */
//         .meta {
//             margin: 8mm 0;
//             position: relative;
//             padding:0px 50px;
//             z-index: 1;
//         }

//         .date {
//             text-align: right;
//             font-size: 18pt;
//             margin-bottom: 0mm;
//             padding-top:20px;
//         }

//         .reference {
//             font-size: 18pt;
//             line-height: 1.1;
//         }

//         /* Title */
//         .title {
//             text-align: center;
//             font-size: 19pt;
//             font-weight: bold;
//             text-decoration: underline;
//             letter-spacing: 0.5px;
//             margin: 10mm 0 2mm 0;
//             position: relative;
//             z-index: 1;
//         }

//         .subtitle {
//             text-align: center;
//             font-size: 19pt;
//             font-weight: bold;
//             text-decoration: underline;
//             margin: 2mm 0 10mm 0;
//             position: relative;
//             z-index: 1;
//         }

//         /* Project info with aligned colons */
//         .info {
//             margin: 8mm 0;
//             font-size: 10pt;
//             line-height: 1.5;
//             position: relative;
//             padding:0px 40px;
//             z-index: 1;
//         }

//         .info-row {
//             display: flex;
//             margin-bottom: 4mm;
//             align-items: flex-start;
//         }

//         .info-label {
//             display:flex;
//             justify-content:space-between;
//             font-weight: bold;
//             width: 23vw;
//             text-align: right;
//             flex-shrink: 0;
//             font-size:20px;
//         }

//         .info-colon {
//             margin: 0 2mm;
//             flex-shrink: 0;
//         }

//         .info-content {
//             font-size:20px;
//             max-width:50vw;
//             flex: 1;
//         }

//         /* Authorization */
//         .auth {
//             text-align: center;
//             font-size: 20px;
//             line-height: 1.4;
//             margin: 12mm 0 8mm 0;
//             position: relative;
//             z-index: 1;
//         }

//         /* Notes - CENTERED with blue box */
//         .notes-container {
//             display: flex;
//             justify-content: center;
//             margin: 0mm 10mm 10mm 10mm;
//             position: relative;
//             z-index: 1;
//         }

//         .notes-box {
//             display: inline-block;
//             text-align: left;
//         }

//         .nb-title {
//             font-weight: bold;
//             text-decoration: underline;
//             font-size: 18px;
//             margin-bottom: 3mm;
//         }

//         .note-item {
//             font-size: 17px;
//             line-height: 1.4;
//             margin: 10px;
//         }

//         /* Stamp */
//         .stamp {
//             text-align: center;
//             margin: 12mm 0 15mm 0;
//             position: relative;
//             z-index: 1;
//         }

//         .stamp-line1 {
//             font-size: 12pt;
//             font-weight: bold;
//             color: #cc0000;
//             letter-spacing: 1px;
//             margin: 0.5mm 0;
//         }

//         .stamp-line2 {
//             font-size: 10pt;
//             color: #cc0000;
//             direction: rtl;
//             margin: 0.5mm 0;
//         }

//         .stamp-line3 {
//             font-size: 8.5pt;
//             color: #cc0000;
//             margin: 0.5mm 0;
//         }

//         .stamp-line4 {
//             font-size: 7.5pt;
//             color: #cc0000;
//             direction: rtl;
//             margin: 0.5mm 0;
//         }

//         /* Footer */
//         .footer {
//             position: fixed;
//             bottom: 0;
//             left: 0;
//             right: 0;
//             text-align: center;
//             font-size: 13px;
//             color: #666;
//             padding: 5mm 0;
//             border-top: 0.5pt solid #999;
//             background: white;
//             z-index: 2;
//         }

//         @media print {
//             .footer {
//                 position: fixed;
//                 bottom: 0;
//             }
            
//             body::before {
//                 position: fixed;
//             }
//         }
//         .no-margin {
//             margin: 0 !important;
//         }
//     </style>
// </head>
// <body>

//     <!-- HEADER -->
//     <div class="header">
//         <div class="header-top">
//             <div class="logo">
//                 ${logoHtml}
//             </div>
//             <div class="header-text">
//                 <div class="company-names">
//                     <span class="name-fr">${company_name_fr}</span>
//                     <span class="name-ar">${company_name_ar}</span>
//                 </div>
//                 <div class="header-info">
//                     <div class="subtitle-ar">${header_ar_sub}</div>
//                     <div class="subtitle-fr">${header_fr_sub}</div>
//                     <div class="address">${header_addr}</div>
//                 </div>
//             </div>
//         </div>
//     </div>

//     <!-- META -->
//     <div class="meta">
//         <div class="date">${ville}, le ${date}</div>
//         <div class="reference">N/Réf : MM/BC/${reference}<br/>B/${reference_2}</div>
//     </div>

//     <!-- TITLE -->
//     <div class="title">${title}</div>
//     <div class="subtitle">-${etage}-</div>

//     <!-- INFO -->
//     <div class="info">
//         <div class="info-row">
//             <div class="info-label"><span>PROPRIETAIRE</span><span>:</span></div>
//             <div class="info-content">
//                 ${proprietaire}
//             </div>
//         </div>
        
//         <div class="info-row">
//             <div class="info-label"><span>PROJET</span><span>:</span></div>
//             <div class="info-content">${projet}</div>
//         </div>
        
//         <div class="info-row">
//             <div class="info-label"><span>ADRESSE</span><span>:</span></div>
//             <div class="info-content">${adresse}</div>
//         </div>
//     </div>

//     <!-- AUTHORIZATION -->
//     <div class="auth">
//         ${authText}
//     </div>

//     <!-- NOTES -->
//     ${notesHtml}
//     <!-- FOOTER -->
//     <div class="footer">
//         ${footer_text || "MARRAKECH BUREAU D'ETUDE TECHNIQUES Tel : 0661175125 / 0662638225"}
//     </div>

// </body>
// </html>`;
// };
exports.generateHTMLBCLG = (options = {}) => {
    const {
      documentType = "BCLG",
      company_name_fr = process.env.COMPANY_NAME_FR || "ATLANTIC ETUDES",
      company_name_ar = process.env.COMPANY_NAME_AR || "دراسات الأطلنتيك",
      header_ar_sub = process.env.COMPANY_HEADER_AR_SUB ||
        "شركة الدراسات و التنسيق في البناء و الهندسة المدنية",
      header_fr_sub = process.env.COMPANY_HEADER_FR_SUB ||
        "Société d'Etudes et de Coordination de Bâtiment et Génie Civil",
      header_addr = process.env.COMPANY_ADDR ||
        "Bd Mohamed Bouziane N° 162 Essalama 3 Casablanca",
      logo_base64 = null,
      date = "",
      ville = "Casa",
      reference = "MM/BC/",
      reference_2 = "B/",
      title = "BON DE COULAGE",
      etage = "PL.HT. S/SOL",
      proprietaire = "SOCIETE ARIF LOGEMENT S.A.R.L. AU.",
      projet = "CONSTRUCTION D'UN IMMEUBLE EN S/SOL + R.D.CH. + SOUPENTE + 3 ETAGES.",
      adresse = "LOTISSEMENT AL MAMOUNIA LOT N° 3 SIDI HAJJAJ OUED HASSAR. T.F. N° 12231/85.",
      footer_text = process.env.FOOTER_TEXT,
    } = options;
    
    console.log("options", etage);
    let show_notes = true;
  
    // Generate authorization text
    const authText = generateAuthorizationText(etage);
    if (etage === "FONDATIONS" || etage === "DALLAGE") {
      show_notes = false;
    }
    
    // Generate notes HTML - CENTERED with blue box
    let notesHtml = "";
    if (show_notes) {
      const notesList = [
        "Augmenter le nombre d'étai.",
        "Bien caler les fonds de poutres",
        "Mettre les calles sur les poutres.",
      ];
      const notesItems = notesList
        .map((note) => `<div class="note-item">* ${note}</div>`)
        .join("\n");
  
      notesHtml = `
          <div class="notes-container">
              <div class="notes-box">
                  <div class="nb-title">N.B :</div>
                  ${notesItems}
              </div>
          </div>
          `;
    }
  
    // Get font base64
    const fontBase64 = getFontBase64();
  
    let base64Image = null;
    try {
      const data = fs.readFileSync(logoPath);
      base64Image = `data:image/jpeg;base64,${data.toString("base64")}`;
    } catch (err) {
      console.error("Error reading logo:", err);
    }
  
    // Logo HTML
    const logoHtml = base64Image ? `<img src="${base64Image}" alt="Logo"/>` : "";
  
    // Build font-face CSS
    const fontFaceCSS = fontBase64 ? `
      @font-face {
        font-family: 'MomoSignature';
        font-style: normal;
        font-weight: 400;
        src: url(data:font/truetype;charset=utf-8;base64,${fontBase64}) format('truetype');
        font-display: block;
      }
    ` : '';
  
    return `<!DOCTYPE html>
  <html lang="fr">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
          ${fontFaceCSS}
          
          @page {
              size: A4;
              margin: 5px 10px 5px 10px;
          }
  
          * {
              margin: 5px 10px 5px 10px;
              padding: 0;
              box-sizing: border-box;
              font-family: 'MomoSignature', 'Times New Roman', Times, serif !important;
          }
  
          body {
              font-family: 'MomoSignature', 'Times New Roman', Times, serif !important;
              font-size: 20.5pt;
              line-height: 1.2;
              margin:0;
              color: #000;
              padding: 0;
              position: relative;
          }
          
          /* Background watermark */
          body::before {
              content: '';
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 60%;
              height: 60%;
              background-image: url('${base64Image}');
              background-repeat: no-repeat;
              background-position: center center;
              background-size: contain;
              opacity: 0.08;
              z-index: -1;
              pointer-events: none;
          }
  
          /* HEADER with UNDERLINE only under company names and logo */
          .header {
              margin-bottom: 2mm;
              position: relative;
              margin-left:0px;
              margin-right:0px;
              z-index: 1;
          }
  
          .header-top {
              display: flex;
              align-items: flex-start;
              margin-left:0px;
              margin-right:0px;
          }
  
          .logo {
              width: 30mm;
              margin:0px;
              flex-shrink: 0;
              margin-top=5px;
          }
  
          .logo img {
              width: 100%;
              height: auto;
          }
  
          .header-text {
              padding-top:20px;
              flex: 1;
          }
  
          .company-names {
              border-bottom: 1px solid #000;
              text-align: center;
              margin-bottom: 1mm;
              white-space: nowrap;
          }
  
          .name-fr {
              font-size: 25pt;
              font-weight: bold;
              display: inline-block;
              font-family: 'MomoSignature', 'Times New Roman', Times, serif !important;
          }
  
          .name-ar {
              font-size: 25pt;
              font-weight: bold;
              direction: rtl;
              display: inline-block;
              margin-left: 50mm;
              font-family: 'MomoSignature', 'Times New Roman', Times, serif !important;
          }
  
          .header-info {
              margin-top:2px;
              font-size: 45px;
              text-align: center;
          }
  
          .subtitle-ar {
              font-size: 21pt;
              direction: rtl;
              margin: 1mm 0;
          }
  
          .subtitle-fr {
              font-size: 15pt;
              margin: 1mm 0;
          }
  
          .address {
              font-size: 15pt;
          }
  
          /* Meta */
          .meta {
              margin: 8mm 0;
              position: relative;
              padding:0px 50px;
              z-index: 1;
          }
  
          .date {
              text-align: right;
              font-size: 18pt;
              margin-bottom: 0mm;
              padding-top:20px;
          }
  
          .reference {
              font-size: 18pt;
              line-height: 1.1;
          }
  
          /* Title */
          .title {
              text-align: center;
              font-size: 19pt;
              font-weight: bold;
              text-decoration: underline;
              letter-spacing: 0.5px;
              margin: 10mm 0 2mm 0;
              position: relative;
              z-index: 1;
          }
  
          .subtitle {
              text-align: center;
              font-size: 19pt;
              font-weight: bold;
              text-decoration: underline;
              margin: 2mm 0 10mm 0;
              position: relative;
              z-index: 1;
          }
  
          /* Project info with aligned colons */
          .info {
              margin: 8mm 0;
              font-size: 10pt;
              line-height: 1.5;
              position: relative;
              padding:0px 40px;
              z-index: 1;
          }
  
          .info-row {
              display: flex;
              margin-bottom: 4mm;
              align-items: flex-start;
          }
  
          .info-label {
              display:flex;
              justify-content:space-between;
              font-weight: bold;
              width: 23vw;
              text-align: right;
              flex-shrink: 0;
              font-size:20px;
          }
  
          .info-colon {
              margin: 0 2mm;
              flex-shrink: 0;
          }
  
          .info-content {
              font-size:20px;
              max-width:50vw;
              flex: 1;
          }
  
          /* Authorization */
          .auth {
              text-align: center;
              font-size: 20px;
              line-height: 1.4;
              margin: 12mm 0 8mm 0;
              position: relative;
              z-index: 1;
          }
  
          /* Notes - CENTERED with blue box */
          .notes-container {
              display: flex;
              justify-content: center;
              margin: 0mm 10mm 10mm 10mm;
              position: relative;
              z-index: 1;
          }
  
          .notes-box {
              display: inline-block;
              text-align: left;
          }
  
          .nb-title {
              font-weight: bold;
              text-decoration: underline;
              font-size: 18px;
              margin-bottom: 3mm;
          }
  
          .note-item {
              font-size: 17px;
              line-height: 1.4;
              margin: 10px;
          }
  
          /* Stamp */
          .stamp {
              text-align: center;
              margin: 12mm 0 15mm 0;
              position: relative;
              z-index: 1;
          }
  
          .stamp-line1 {
              font-size: 12pt;
              font-weight: bold;
              color: #cc0000;
              letter-spacing: 1px;
              margin: 0.5mm 0;
          }
  
          .stamp-line2 {
              font-size: 10pt;
              color: #cc0000;
              direction: rtl;
              margin: 0.5mm 0;
          }
  
          .stamp-line3 {
              font-size: 8.5pt;
              color: #cc0000;
              margin: 0.5mm 0;
          }
  
          .stamp-line4 {
              font-size: 7.5pt;
              color: #cc0000;
              direction: rtl;
              margin: 0.5mm 0;
          }
  
          /* Footer */
          .footer {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              text-align: center;
              font-size: 13px;
              color: #666;
              padding: 5mm 0;
              border-top: 0.5pt solid #999;
              background: white;
              z-index: 2;
          }
  
          @media print {
              .footer {
                  position: fixed;
                  bottom: 0;
              }
              
              body::before {
                  position: fixed;
              }
          }
          .no-margin {
              margin: 0 !important;
          }
      </style>
  </head>
  <body>
  
      <!-- HEADER -->
      <div class="header">
          <div class="header-top">
              <div class="logo">
                  ${logoHtml}
              </div>
              <div class="header-text">
                  <div class="company-names">
                      <span class="name-fr">${company_name_fr}</span>
                      <span class="name-ar">${company_name_ar}</span>
                  </div>
                  <div class="header-info">
                      <div class="subtitle-ar">${header_ar_sub}</div>
                      <div class="subtitle-fr">${header_fr_sub}</div>
                      <div class="address">${header_addr}</div>
                  </div>
              </div>
          </div>
      </div>
  
      <!-- META -->
      <div class="meta">
          <div class="date">${ville}, le ${date}</div>
          <div class="reference">N/Réf : MM/BC/${reference}<br/>B/${reference_2}</div>
      </div>
  
      <!-- TITLE -->
      <div class="title">${title}</div>
      <div class="subtitle">-${etage}-</div>
  
      <!-- INFO -->
      <div class="info">
          <div class="info-row">
              <div class="info-label"><span>PROPRIETAIRE</span><span>:</span></div>
              <div class="info-content">
                  ${proprietaire}
              </div>
          </div>
          
          <div class="info-row">
              <div class="info-label"><span>PROJET</span><span>:</span></div>
              <div class="info-content">${projet}</div>
          </div>
          
          <div class="info-row">
              <div class="info-label"><span>ADRESSE</span><span>:</span></div>
              <div class="info-content">${adresse}</div>
          </div>
      </div>
  
      <!-- AUTHORIZATION -->
      <div class="auth">
          ${authText}
      </div>
  
      <!-- NOTES -->
      ${notesHtml}
      <!-- FOOTER -->
      <div class="footer">
          ${footer_text || "MARRAKECH BUREAU D'ETUDE TECHNIQUES Tel : 0661175125 / 0662638225"}
      </div>
  
  </body>
  </html>`;
  };
/**
 * Generate authorization text based on floor type
 * @param {string} etage - Floor type
 * @returns {string} Authorization HTML
 */
function generateAuthorizationText(etage) {
  const etageUpper = etage.toUpperCase();
  if (etageUpper.includes("DALLE") || etageUpper.includes("DL")) {
    return `
        Le bureau d'Etudes « ATLANTIC ETUDES » autorise<br/>
        le coulage du Béton au niveau du Dallage de la<br/>
        Construction citée en objet.
        `;
  }
  if (etageUpper.includes("FONDATIONS") || etageUpper.includes("FONDATION")) {
    return `
        Le bureau d'Etudes « ATLANTIC ETUDES » autorise<br/>
        le coulage du Béton au niveau des Fondations de la<br/>
        Construction citée en objet.
        `;
  }

  if (etageUpper.includes("S/SOL") || etageUpper.includes("SSOL")) {
    return `
        Le bureau d'Etudes « ATLANTIC ETUDES » autorise<br/>
        le coulage du Béton au niveau du Plancher Haut S/SOL<br/>
        au niveau de la construction citée en objet.
        `;
  }

  if (etageUpper.includes("SOUPENTE")) {
    return `
        Le bureau d'Etudes « ATLANTIC ETUDES » autorise<br/>
        le coulage du Béton au niveau de la soupente de la construction<br/>
        citée en objet.
        `;
  }

  if (etageUpper.includes("R.D.CH") || etageUpper.includes("RDCH")) {
    return `
        Le bureau d'Etudes « ATLANTIC ETUDES » autorise<br/>
        le coulage du Béton au niveau du Plancher Haut R.D.CH<br/>
        de la construction citée en objet.
        `;
  }

  if (etageUpper.includes("ETAGE") || etageUpper.includes("ÉTAGE")) {
    const match = etage.match(/(\d+)/);
    if (match) {
      const num = match[1];
      const suffix = num === "1" ? "er" : "ème";
      return `
            Le bureau d'Etudes « ATLANTIC ETUDES » autorise<br/>
            le coulage du Béton au niveau plancher haut ${num}<sup class="no-margin">${suffix}</sup> étage<br/>
            de la construction citée en objet.
            `;
    }
  }

  return `
    Le bureau d'Etudes « ATLANTIC ETUDES » autorise<br/>
    le coulage du Béton au niveau de la construction<br/>
    citée en objet.
    `;
}

// Export the function
exports.generateAuthorizationText = generateAuthorizationText;
