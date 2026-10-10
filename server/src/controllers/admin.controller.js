const User = require('../models/User');
const StudyMaterial = require('../models/StudyMaterial');
const Software = require('../models/Software');

const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalStudents, totalAdmins, totalMaterials, totalSoftware, recentMaterials, recentUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'admin' }),
      StudyMaterial.countDocuments(),
      Software.countDocuments(),
      StudyMaterial.find().sort({ createdAt: -1 }).limit(5).populate('uploader', 'fullName'),
      User.find().sort({ createdAt: -1 }).limit(5).select('fullName email role createdAt'),
    ]);

    res.json({
      success: true,
      data: {
        stats: { totalUsers, totalStudents, totalAdmins, totalMaterials, totalSoftware },
        recentMaterials,
        recentUsers,
      },
    });
  } catch (err) { next(err); }
};

const getUnapprovedMaterials = async (req, res, next) => {
  try {
    const materials = await StudyMaterial.find({ isApproved: false })
      .populate('uploader', 'fullName email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: materials, total: materials.length });
  } catch (err) { next(err); }
};

const approveMaterial = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!material) return res.status(404).json({ success: false, message: 'Material not found.' });
    res.json({ success: true, message: 'Material approved.', data: material });
  } catch (err) { next(err); }
};

// POST /api/admin/seed — seeds sample data (admin only)
const runSeed = async (req, res, next) => {
  try {
    // Only seed if collections are empty
    const [matCount, swCount] = await Promise.all([
      StudyMaterial.countDocuments(),
      Software.countDocuments(),
    ]);

    if (matCount > 0 || swCount > 0) {
      return res.json({
        success: true,
        message: `Already seeded. Materials: ${matCount}, Software: ${swCount}`,
      });
    }

    const softwareData = [
      { name:'Visual Studio Code', description:'Free open-source code editor by Microsoft with extensions for every language.', category:'Programming', officialWebsite:'https://code.visualstudio.com', pricingUrl:'https://code.visualstudio.com', accessType:'Free', accessInstructions:'Download from code.visualstudio.com. No registration required.', isVerified:true, lastVerifiedDate:new Date(), tags:['editor','code','microsoft'] },
      { name:'GitHub', description:'World\'s largest code hosting platform. Students get GitHub Pro free via GitHub Education.', category:'Programming', officialWebsite:'https://github.com', pricingUrl:'https://github.com/pricing', accessType:'Student Plan', accessInstructions:'Apply for GitHub Student Developer Pack at education.github.com using your college email.', isVerified:true, lastVerifiedDate:new Date(), tags:['git','version control','collaboration'] },
      { name:'JetBrains IDEs', description:'Professional IDEs: IntelliJ IDEA, PyCharm, WebStorm and more. Free for students.', category:'Programming', officialWebsite:'https://www.jetbrains.com', pricingUrl:'https://www.jetbrains.com/student', accessType:'Student Plan', accessInstructions:'Apply at jetbrains.com/student using your college email.', isVerified:true, lastVerifiedDate:new Date(), tags:['IDE','Java','Python'] },
      { name:'Figma', description:'Collaborative UI/UX design tool. Free for students and educators.', category:'Design', officialWebsite:'https://figma.com', pricingUrl:'https://www.figma.com/education', accessType:'Student Plan', accessInstructions:'Apply for Figma Education plan at figma.com/education with your college email.', isVerified:true, lastVerifiedDate:new Date(), tags:['UI','UX','design'] },
      { name:'Canva', description:'Easy drag-and-drop design platform with thousands of templates.', category:'Design', officialWebsite:'https://canva.com', pricingUrl:'https://www.canva.com/canva-for-education', accessType:'Student Plan', accessInstructions:'Sign up with your college email at canva.com/canva-for-education.', isVerified:true, lastVerifiedDate:new Date(), tags:['design','presentations','graphics'] },
      { name:'Notion', description:'All-in-one workspace for notes, tasks, wikis and databases. Free for students.', category:'Productivity', officialWebsite:'https://notion.so', pricingUrl:'https://www.notion.so/product/notion-for-education', accessType:'Student Plan', accessInstructions:'Sign up with .edu email or verify at notion.so/product/notion-for-education.', isVerified:true, lastVerifiedDate:new Date(), tags:['notes','productivity','wiki'] },
      { name:'ChatGPT', description:'OpenAI\'s powerful AI assistant. Great for studying, coding help, and writing.', category:'AI Tools', officialWebsite:'https://chat.openai.com', pricingUrl:'https://openai.com/pricing', accessType:'Free Tier', accessInstructions:'Sign up free at chat.openai.com. Free tier includes GPT-4o with limited usage.', isVerified:true, lastVerifiedDate:new Date(), tags:['AI','chatbot','writing'] },
      { name:'Google Colab', description:'Free cloud Jupyter notebooks with GPU access for machine learning.', category:'AI Tools', officialWebsite:'https://colab.research.google.com', pricingUrl:'https://colab.research.google.com/signup', accessType:'Free', accessInstructions:'Access at colab.research.google.com with any Google account.', isVerified:true, lastVerifiedDate:new Date(), tags:['AI','machine learning','Python'] },
      { name:'Microsoft Azure for Students', description:'Full Azure cloud platform. Students get $100 free credits, no credit card required.', category:'Cloud Computing', officialWebsite:'https://azure.microsoft.com/free/students', pricingUrl:'https://azure.microsoft.com/en-us/free/students', accessType:'Student Plan', accessInstructions:'Sign up at azure.microsoft.com/free/students with your college email.', isVerified:true, lastVerifiedDate:new Date(), tags:['cloud','Azure','Microsoft'] },
      { name:'AWS Educate', description:'Amazon Web Services educational programme with cloud learning and credits.', category:'Cloud Computing', officialWebsite:'https://aws.amazon.com/education/awseducate', pricingUrl:'https://aws.amazon.com/education/awseducate', accessType:'Student Plan', accessInstructions:'Register at aws.amazon.com/education/awseducate with your college email.', isVerified:true, lastVerifiedDate:new Date(), tags:['cloud','AWS','Amazon'] },
      { name:'Google Workspace', description:'Gmail, Docs, Sheets, Slides, Drive and Calendar. Free for personal use.', category:'Office Applications', officialWebsite:'https://workspace.google.com', pricingUrl:'https://workspace.google.com/pricing', accessType:'Free', accessInstructions:'Use any Gmail account. Many colleges provide Google Workspace accounts.', isVerified:true, lastVerifiedDate:new Date(), tags:['Google Docs','Drive','Gmail'] },
      { name:'Microsoft 365 for Education', description:'Word, Excel, PowerPoint, Teams and more. Many colleges provide it free.', category:'Office Applications', officialWebsite:'https://www.microsoft.com/en-us/education/products/office', pricingUrl:'https://www.microsoft.com/en-us/education/products/office', accessType:'Student Plan', accessInstructions:'Visit microsoft.com/education and sign in with your college email.', isVerified:true, lastVerifiedDate:new Date(), tags:['Word','Excel','PowerPoint','Teams'] },
      { name:'Grammarly', description:'AI writing assistant for grammar, spelling and clarity. Great for assignments.', category:'AI Tools', officialWebsite:'https://grammarly.com', pricingUrl:'https://www.grammarly.com/plans', accessType:'Free Tier', accessInstructions:'Sign up free at grammarly.com. Free plan covers essential grammar checks.', isVerified:true, lastVerifiedDate:new Date(), tags:['writing','grammar','AI'] },
      { name:'Replit', description:'Browser-based IDE supporting 50+ languages. Great for quick coding without setup.', category:'Programming', officialWebsite:'https://replit.com', pricingUrl:'https://replit.com/pricing', accessType:'Free Tier', accessInstructions:'Sign up free at replit.com. Free tier includes unlimited public repls.', isVerified:true, lastVerifiedDate:new Date(), tags:['online IDE','browser','coding'] },
      { name:'Postman', description:'Most popular API platform for building and testing REST and GraphQL APIs.', category:'Programming', officialWebsite:'https://www.postman.com', pricingUrl:'https://www.postman.com/pricing', accessType:'Free', accessInstructions:'Download or use web version at postman.com. Free plan is fully featured.', isVerified:true, lastVerifiedDate:new Date(), tags:['API','testing','REST'] },
    ];

    const materialData = [
      { title:'Data Structures and Algorithms — Complete Notes', description:'Comprehensive notes covering arrays, linked lists, trees, graphs, sorting and searching algorithms with complexity analysis.', subject:'Data Structures and Algorithms', department:'Computer Science', semester:3, type:'Notes', fileUrl:'https://drive.google.com/file/d/example-dsa', fileName:'dsa-notes.pdf', tags:['DSA','algorithms','data structures'] },
      { title:'Operating Systems — Process Management PPT', description:'Slides on process lifecycle, CPU scheduling, deadlocks, and memory management.', subject:'Operating Systems', department:'Computer Science', semester:4, type:'PPT', fileUrl:'https://drive.google.com/file/d/example-os', fileName:'os-process.pptx', tags:['OS','scheduling','deadlock'] },
      { title:'Database Management Systems — Complete Guide', description:'Full DBMS guide covering ER diagrams, normalization, SQL, transactions, and indexing.', subject:'Database Management Systems', department:'Computer Science', semester:4, type:'Notes', fileUrl:'https://drive.google.com/file/d/example-dbms', fileName:'dbms-guide.pdf', tags:['DBMS','SQL','normalization'] },
      { title:'Computer Networks — OSI and TCP/IP Reference', description:'OSI 7-layer model, TCP/IP, subnetting, routing protocols, DNS, and HTTP.', subject:'Computer Networks', department:'Computer Science', semester:5, type:'Notes', fileUrl:'https://drive.google.com/file/d/example-cn', fileName:'cn-reference.pdf', tags:['networks','OSI','TCP/IP'] },
      { title:'Engineering Mathematics — Calculus and Differential Equations', description:'Limits, derivatives, integration, ODEs, Laplace transforms and Fourier series with solved examples.', subject:'Engineering Mathematics', department:'All Departments', semester:2, type:'Notes', fileUrl:'https://drive.google.com/file/d/example-maths', fileName:'eng-maths.pdf', tags:['mathematics','calculus','differential equations'] },
      { title:'Digital Electronics — Logic Gates and Boolean Algebra', description:'Logic gates, Boolean algebra theorems, Karnaugh maps, combinational and sequential circuits.', subject:'Digital Electronics', department:'Electronics and Communication', semester:3, type:'Notes', fileUrl:'https://drive.google.com/file/d/example-de', fileName:'digital-electronics.pdf', tags:['digital','logic gates','Boolean algebra'] },
      { title:'Object Oriented Programming in Java — Notes', description:'OOP fundamentals: classes, inheritance, polymorphism, encapsulation, interfaces and collections.', subject:'Object Oriented Programming', department:'Computer Science', semester:2, type:'Notes', fileUrl:'https://drive.google.com/file/d/example-oop', fileName:'oop-java.pdf', tags:['Java','OOP','inheritance'] },
      { title:'Software Engineering — SDLC and Design Patterns', description:'SDLC models, UML diagrams, design patterns (Singleton, Factory, MVC), and testing strategies.', subject:'Software Engineering', department:'Computer Science', semester:5, type:'Notes', fileUrl:'https://drive.google.com/file/d/example-se', fileName:'software-engineering.pdf', tags:['SDLC','Agile','design patterns'] },
      { title:'Web Development — HTML CSS JavaScript Cheat Sheet', description:'HTML5, CSS flexbox/grid, JavaScript ES6+, DOM manipulation and responsive design.', subject:'Web Technologies', department:'Computer Science', semester:4, type:'PDF', fileUrl:'https://drive.google.com/file/d/example-webdev', fileName:'webdev-cheatsheet.pdf', tags:['HTML','CSS','JavaScript'] },
      { title:'Machine Learning — Algorithms and Implementation Notes', description:'Supervised/unsupervised learning, regression, decision trees, SVM, clustering with Python examples.', subject:'Machine Learning', department:'Information Technology', semester:6, type:'Notes', fileUrl:'https://drive.google.com/file/d/example-ml', fileName:'ml-notes.pdf', tags:['machine learning','Python','neural networks'] },
      { title:'Cyber Security — Fundamentals and Ethical Hacking', description:'CIA triad, cryptography, SSL/TLS, common attacks, firewalls and ethical hacking basics.', subject:'Cyber Security', department:'Information Technology', semester:6, type:'Notes', fileUrl:'https://drive.google.com/file/d/example-cs', fileName:'cyber-security.pdf', tags:['cyber security','cryptography','ethical hacking'] },
      { title:'Engineering Physics — Wave Optics and Quantum Mechanics', description:'Interference, diffraction, laser, fibre optics, photoelectric effect and Schrodinger equation.', subject:'Engineering Physics', department:'All Departments', semester:1, type:'Notes', fileUrl:'https://drive.google.com/file/d/example-physics', fileName:'eng-physics.pdf', tags:['physics','optics','quantum mechanics'] },
      { title:'Data Structures — End Semester Exam 2023', description:'University end semester question paper for DSA covering arrays, trees, sorting and graph algorithms.', subject:'Data Structures and Algorithms', department:'Computer Science', semester:3, type:'Question Paper', year:2023, examType:'End Semester', fileUrl:'https://drive.google.com/file/d/example-dsa-qp', fileName:'dsa-end-sem-2023.pdf', tags:['question paper','DSA','2023'] },
      { title:'Operating Systems — End Semester Exam 2023', description:'End semester paper covering virtual memory, file systems, deadlock and security.', subject:'Operating Systems', department:'Computer Science', semester:4, type:'Question Paper', year:2023, examType:'End Semester', fileUrl:'https://drive.google.com/file/d/example-os-qp', fileName:'os-end-sem-2023.pdf', tags:['question paper','OS','2023'] },
      { title:'Engineering Mathematics — Mid Semester 2023', description:'Mid semester paper covering limits, derivatives, integration and matrix operations.', subject:'Engineering Mathematics', department:'All Departments', semester:2, type:'Question Paper', year:2023, examType:'Mid Semester', fileUrl:'https://drive.google.com/file/d/example-maths-qp', fileName:'maths-mid-2023.pdf', tags:['question paper','mathematics','2023'] },
    ];

    const adminUser = await User.findOne({ role: 'admin' });
    const uploaderUser = await User.findOne({ role: 'student' }) || adminUser;

    await Software.insertMany(softwareData.map(s => ({ ...s, addedBy: adminUser._id })));
    await StudyMaterial.insertMany(materialData.map(m => ({ ...m, uploader: uploaderUser._id, isApproved: true })));

    res.json({
      success: true,
      message: `Seeded successfully! ${softwareData.length} software, ${materialData.length} materials added.`,
    });
  } catch (err) { next(err); }
};

module.exports = { getStats, getUnapprovedMaterials, approveMaterial, runSeed };
