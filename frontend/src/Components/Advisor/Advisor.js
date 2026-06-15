import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import "./Advisor.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

const Advisor = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "Hello! I'm your Agricultural Advisor. How can I help you today? 🌾\n\nහෙලෝ! මම ඔබේ කෘෂිකර්ම උපදේශකයා. අද මට ඔබට කෙසේ උදව් කළ හැකිද? 🌾",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const [currentMessage, setCurrentMessage] = useState("");
  const [language, setLanguage] = useState("english");
  const [budgetLevel, setBudgetLevel] = useState("medium");
  const [isTyping, setIsTyping] = useState(false);

  // Expanded advice database with specific questions
  const adviceDatabase = {
    english: {
      "soil health": {
        low: "🌱 Low Budget Soil Health Solutions:\n\n• Create compost from kitchen waste and farm residue\n• Practice crop rotation with legumes to fix nitrogen\n• Use mulching with available plant materials\n• Make DIY pH tests using vinegar and baking soda\n• Collect and apply wood ash for potassium\n• Plant cover crops during off-season",
        medium: "🌱 Medium Budget Soil Health:\n\n• Purchase organic fertilizers and bone meal\n• Invest in basic soil testing kits\n• Start vermicomposting with earthworms\n• Use green manure crops strategically\n• Apply neem cake and other organic amendments\n• Install basic drainage systems",
        high: "🌱 Premium Soil Health Solutions:\n\n• Implement precision agriculture with soil sensors\n• Use drip fertigation systems\n• Professional laboratory soil analysis\n• Premium organic amendments and bio-fertilizers\n• Automated pH and nutrient monitoring\n• Invest in raised beds with controlled soil mix",
      },
      "water management": {
        low: "💧 Budget-Friendly Water Management:\n\n• Harvest rainwater in simple containers\n• Use mulch heavily to retain moisture\n• Practice manual drip using bottles\n• Dig swales and contour trenches\n• Water early morning or late evening\n• Recycle household greywater safely",
        medium: "💧 Moderate Water Management:\n\n• Install basic drip irrigation system\n• Use water storage tanks (500-1000L)\n• Implement moisture sensors in key areas\n• Set up greywater recycling system\n• Use timer-based irrigation\n• Install rain gauges for monitoring",
        high: "💧 Advanced Water Management:\n\n• Smart irrigation with weather integration\n• Automated soil moisture monitoring\n• Advanced filtration and treatment systems\n• IoT-based water usage tracking\n• Precision sprinkler systems\n• Underground water storage solutions",
      },
      "organic farming": {
        low: "🌿 Low-Cost Organic Farming:\n\n• Make neem oil spray at home\n• Practice companion planting\n• Use soap and chili spray for pests\n• Create DIY compost tea\n• Hand-pick pests regularly\n• Attract beneficial insects naturally",
        medium: "🌿 Moderate Organic Approach:\n\n• Purchase certified organic seeds\n• Use biological pest control products\n• Build insect hotels and habitats\n• Invest in quality organic fertilizers\n• Implement crop rotation systems\n• Use organic mulches and amendments",
        high: "🌿 Premium Organic Farming:\n\n• Build greenhouse with climate control\n• Get organic certification for premium pricing\n• Advanced integrated pest management\n• Precision nutrient management systems\n• Professional organic consultancy\n• High-value organic crop selection",
      },
      "pest control": {
        low: "🐛 Natural Pest Control:\n\n• Spray neem leaves water solution\n• Plant marigolds around crops\n• Use garlic and chili spray\n• Remove affected plants promptly\n• Encourage birds and beneficial insects\n• Practice manual pest removal\n\n**Specific Remedies:**\n• For aphids: Mix 1 tbsp dish soap with 1 quart water and spray.\n• For caterpillars: Handpick or use BT (Bacillus thuringiensis).\n• For beetles: Neem oil or row covers.",
        medium: "🐛 Moderate Pest Management:\n\n• Use organic pesticides (BT, Spinosad)\n• Install pheromone traps\n• Apply neem oil and insecticidal soap\n• Create beneficial insect habitats\n• Use sticky traps strategically\n• Implement crop rotation\n\n**Specific Remedies:**\n• For squash bugs: Diatomaceous earth or neem.\n• For potato beetles: Handpick eggs and use row covers.\n• For spider mites: Increase humidity and use insecticidal soap.",
        high: "🐛 Advanced Pest Control:\n\n• Integrated pest management system\n• Regular professional scouting\n• Biological control agents\n• High-tech monitoring systems\n• Precision application equipment\n• Preventive greenhouse cultivation\n\n**Specific Remedies:**\n• For whiteflies: Reflective mulches and predatory insects.\n• For thrips: Blue sticky traps and spinosad.\n• For cutworms: Collars around plants and beneficial nematodes.",
      },
      "crop nutrition": {
        low: "🌾 Budget Crop Nutrition:\n\n• Make compost tea for liquid feeding\n• Use banana peels for potassium\n• Apply eggshells for calcium\n• Practice green manuring\n• Use wood ash carefully\n• Rotate with nitrogen-fixing crops",
        medium: "🌾 Balanced Crop Nutrition:\n\n• Use organic NPK fertilizers\n• Apply micronutrient supplements\n• Regular foliar feeding\n• Soil testing before application\n• Use bio-fertilizers and mycorrhizae\n• Implement proper timing schedules",
        high: "🌾 Precision Crop Nutrition:\n\n• Tissue analysis for exact needs\n• Automated fertigation systems\n• Premium slow-release fertilizers\n• Drone-based nutrient mapping\n• Customized nutrient formulations\n• Real-time nutrient monitoring",
      },
      "disease management": {
        low: "🦠 Low-Cost Disease Prevention:\n\n• Remove and burn infected plants\n• Use proper spacing for air circulation\n• Apply cinnamon powder as fungicide\n• Make turmeric spray for diseases\n• Keep tools clean and sanitized\n• Practice crop rotation strictly",
        medium: "🦠 Moderate Disease Control:\n\n• Use organic fungicides (copper, sulfur)\n• Install disease-resistant varieties\n• Apply preventive bio-fungicides\n• Regular monitoring and scouting\n• Use disease-free certified seeds\n• Implement proper sanitation",
        high: "🦠 Advanced Disease Management:\n\n• Professional disease diagnostics\n• Greenhouse production systems\n• Advanced bio-control agents\n• Climate-controlled environments\n• Precision application technology\n• Disease forecasting systems",
      },
      "yield improvement": {
        low: "📈 Boost Yield on Budget:\n\n• Optimize plant spacing\n• Remove weak seedlings early\n• Practice successive planting\n• Maximize sunlight exposure\n• Use companion planting wisely\n• Save and select best seeds",
        medium: "📈 Moderate Yield Enhancement:\n\n• Use hybrid high-yielding varieties\n• Implement proper irrigation schedules\n• Apply balanced fertilization\n• Use row covers and mulches\n• Practice succession planting\n• Monitor and adjust pH levels",
        high: "📈 Maximum Yield Strategy:\n\n• Greenhouse cultivation systems\n• Hydroponics or aquaponics\n• Climate-controlled environments\n• Precision agriculture technology\n• Professional crop consultancy\n• Advanced breeding selections",
      },
      "seasonal planning": {
        low: "📅 Seasonal Planning Tips:\n\n• Follow traditional planting calendar\n• Save seeds from best plants\n• Plan crop rotation annually\n• Start seedlings in improvised nursery\n• Use local weather patterns\n• Prepare land in advance",
        medium: "📅 Structured Seasonal Plan:\n\n• Use weather apps and forecasts\n• Create detailed planting schedules\n• Invest in season extension tools\n• Plan for market demand timing\n• Use soil amendments pre-season\n• Document results for improvement",
        high: "📅 Advanced Seasonal Strategy:\n\n• Climate data analytics\n• Professional agronomist consultation\n• Greenhouse for year-round production\n• Market analysis integration\n• Automated environmental controls\n• Multi-season planning software",
      },
      "grow carrots": {
        low: "🥕 How to Grow Carrots - Low Budget:\n\n1. Choose a sunny spot with loose, sandy soil (pH 6.0-6.8).\n2. Sow seeds 1/4 inch deep, 1/2 inch apart in rows 12 inches apart, 4-6 weeks before last frost.\n3. Water gently to keep soil moist; use mulch to retain moisture.\n4. Thin seedlings to 3 inches apart when 2 inches tall.\n5. Harvest in 60-80 days when 1/2-1 inch diameter.\n\nTip: Mix radish seeds to mark rows and loosen soil.",
        medium: "🥕 How to Grow Carrots - Medium Budget:\n\n1. Prepare soil by tilling deeply and adding compost.\n2. Sow in raised beds for better drainage; use seed tape for even spacing.\n3. Install drip irrigation for consistent moisture.\n4. Thin and hill soil around roots to prevent cracking.\n5. Fertilize lightly with balanced organic NPK.\n6. Harvest selectively for continuous supply.",
        high: "🥕 How to Grow Carrots - High Budget:\n\n1. Use precision seeders in controlled greenhouse environment.\n2. Monitor soil with sensors for optimal pH and moisture.\n3. Apply fertigation with customized nutrients.\n4. Use disease-resistant varieties and IPM for pests.\n5. Harvest with automated tools; store in climate-controlled conditions.\n\nExpected yield: Up to 20 tons/acre with optimal management.",
      },
    },
    sinhala: {
      "soil health": {
        low: "🌱 අඩු වියදමින් පාංශු සෞඛ්‍යය:\n\n• කුස්සි අපද්‍රව්‍යයෙන් කොම්පෝස්ට් සාදන්න\n• ධාන්‍ය භ්‍රමණය කරන්න\n• ලබා ගත හැකි ශාක ද්‍රව්‍ය භාවිත කර මල්චිං කරන්න\n• විනාකිරි සහ සෝඩා භාවිත කර DIY pH පරීක්ෂණ\n• ලී අළු එකතු කර යොදන්න\n• අතුරු කාලයේදී ආවරණ භෝග වගා කරන්න",
        medium: "🌱 මධ්‍යම වියදමින් පාංශු සෞඛ්‍යය:\n\n• කාබනික පොහොර සහ අස්ථි කුඩු මිලදී ගන්න\n• මූලික පාංශු පරීක්ෂණ කට්ටල\n• පොළොවුන් සමඟ වර්මි කොම්පෝස්ට්\n• හරිත පොහොර භෝග උපායශීලීව භාවිත කරන්න\n• නීම් කේක් යොදන්න\n• මූලික ජලාපවහන පද්ධති",
        high: "🌱 ප්‍රිමියම් පාංශු සෞඛ්‍යය:\n\n• පාංශු සංවේදක සමඟ නිරවද්‍ය කෘෂිකර්මය\n• ටිප් පොහොර ජලාභරණ පද්ධති\n• වෘත්තීය රසායනාගාර පාංශු විශ්ලේෂණය\n• ප්‍රිමියම් කාබනික යොදා ගැනීම්\n• ස්වයංක්‍රීය pH සහ පෝෂක අධීක්ෂණය\n• පාලිත පස් මිශ්‍රණය සමඟ උස් ඇඳන්",
      },
      "water management": {
        low: "💧 අඩු වියදමින් ජල කළමණාකරණය:\n\n• සරල බහාලුම්වල වැසි ජලය රැස් කරන්න\n• තෙතමනය රඳවා ගැනීමට මල්චිං භාවිත කරන්න\n• බෝතල් භාවිතයෙන් අතින් ටිප්\n• ස්වේල් සහ සමෝච්ඡ අගල් හාරන්න\n• උදේ හෝ සවස ජලය දෙන්න\n• ගෘහස්ථ අළු ජලය ආරක්ෂිතව ප්‍රතිචක්‍රීකරණය",
        medium: "💧 මධ්‍යම ජල කළමණාකරණය:\n\n• මූලික ටිප් ජලාභරණ පද්ධතිය\n• ජල ගබඩා ටැංකි (500-1000L)\n• ප්‍රධාන ප්‍රදේශවල තෙත්කම සංවේදක\n• අළු ජල ප්‍රතිචක්‍රීකරණ පද්ධතිය\n• කාල පාදක ජලාභරණය\n• වැසි මාපක ස්ථාපනය",
        high: "💧 උසස් ජල කළමණාකරණය:\n\n• කාලගුණ ඒකාබද්ධ ස්මාර්ට් ජලාභරණය\n• ස්වයංක්‍රීය පාංශු තෙත්කම අධීක්ෂණය\n• උසස් පෙරීම සහ ප්‍රතිකාර පද්ධති\n• IoT පාදක ජල භාවිත ලුහුබැඳීම\n• නිරවද්‍ය ඉසින පද්ධති\n• භූගත ජල ගබඩා විසඳුම්",
      },
      "pest control": {
        low: "🐛 ස්වාභාවික පළිබෝධ පාලනය:\n\n• නීම් කොළ ජල ද්‍රාවණය ඉසින්න\n• බෝග වටා මැරිගෝල්ඩ් වගා කරන්න\n• සුදුළූණු සහ මිරිස් ඉසින්න\n• බලපෑමට ලක් වූ පැල වහාම ඉවත් කරන්න\n• කුරුල්ලන් සහ ප්‍රයෝජනවත් කෘමීන් දිරිමත් කරන්න\n• අතින් පළිබෝධ ඉවත් කිරීම\n\n**විශේෂ උපදෙස්:**\n• ඇෆිඩ් සඳහා: 1 තේ හැඳි සබන් 1 ක්වාර්ට් ජලය සමඟ මිශ්‍ර කර ඉසින්න.\n• කැටර්පිලර් සඳහා: අතින් ඉවත් කරන්න හෝ BT භාවිත කරන්න.\n• බීටල් සඳහා: නීම් තෙල් හෝ පේළි ආවරණ.",
        medium: "🐛 මධ්‍යම පළිබෝධ කළමණාකරණය:\n\n• කාබනික කෘමිනාශක භාවිත කරන්න\n• ෆෙරමෝන උගුල් ස්ථාපනය කරන්න\n• නීම් තෙල් සහ කෘමිනාශක සබන්\n• ප්‍රයෝජනවත් කෘමි වාසස්ථාන\n• ඇලෙන සුළු උගුල් උපායශීලීව\n• ධාන්‍ය භ්‍රමණය ක්‍රියාත්මක කරන්න\n\n**විශේෂ උපදෙස්:**\n• ස්කොෂ් බග් සඳහා: ඩයාටෝමේෂියස් බිත්ර හෝ නීම්.\n• පොටේටෝ බීටල් සඳහා: බිත්තර අතින් ඉවත් කරන්න සහ පේළි ආවරණ.\n• ස්පයිඩර් මයිට් සඳහා: තෙතමනය වැඩි කරන්න සහ කෘමිනාශක සබන්.",
        high: "🐛 උසස් පළිබෝධ පාලනය:\n\n• ඒකාබද්ධ පළිබෝධ කළමණාකරණ පද්ධතිය\n• නිරන්තර වෘත්තීය නිරීක්ෂණය\n• ජීව විද්‍යාත්මක පාලන කාරක\n• උසස් තාක්ෂණික අධීක්ෂණ පද්ධති\n• නිරවද්‍ය යෙදුම් උපකරණ\n• වැළැක්වීමේ හරිතාගාර වගාව\n\n**විශේෂ උපදෙස්:**\n• වයිට්ෆ්ලයි සඳහා: ප්‍රතිබිම්බ මල්චිං සහ preදාටරි කෘමීන්.\n• ත්‍රිප්ස් සඳහා: නිල් ඇලෙන උගුල් සහ ස්පිනෝසඩ්.\n• කට්වර්ම්ස් සඳහා: පැල වටා කොලර් සහ ප්‍රයෝජනවත් නෙමාටෝඩ්.",
      },
      "crop nutrition": {
        low: "🌾 අඩු වියදමින් බෝග පෝෂණය:\n\n• ද්‍රව පෝෂණය සඳහා කොම්පෝස්ට් තේ සාදන්න\n• පොටෑසියම් සඳහා කෙසෙල් පීල්\n• කැල්සියම් සඳහා බිත්තර කටු\n• හරිත පොහොර\n• ලී අළු ප්‍රවේශමින් යොදන්න\n• නයිට්‍රජන් ස්ථාවර භෝග සමඟ භ්‍රමණය",
        medium: "🌾 සමබර බෝග පෝෂණය:\n\n• කාබනික NPK පොහොර භාවිත කරන්න\n• ක්ෂුද්‍ර පෝෂක අතිරේක යොදන්න\n• නිතිපතා පත්‍ර පෝෂණය\n• යෙදීමට පෙර පාංශු පරීක්ෂණ\n• ජෛව පොහොර භාවිත කරන්න\n• නිසි කාල සටහන් ක්‍රියාත්මක කරන්න",
        high: "🌾 නිරවද්‍ය බෝග පෝෂණය:\n\n• නිවැරදි අවශ්‍යතා සඳහා පටක විශ්ලේෂණය\n• ස්වයංක්‍රීය පොහොර ජලාභරණ පද්ධති\n• ප්‍රිමියම් මන්දගාමී මුදා හැරීමේ පොහොර\n• ඩ්‍රෝන පාදක පෝෂක සිතියම්කරණය\n• අභිරුචි පෝෂක සූත්‍රීකරණ\n• තථ්‍ය කාලීන පෝෂක අධීක්ෂණය",
      },
      "disease management": {
        low: "🦠 අඩු වියදමින් රෝග වැළැක්වීම:\n\n• ආසාදිත පැල ඉවත් කර පුළුස්සන්න\n• වායු සංසරණය සඳහා නිසි පරතරය\n• දිලීර නාශකයක් ලෙස කුරුඳු කුඩු යොදන්න\n• රෝග සඳහා කහ ඉසින්න\n• මෙවලම් පිරිසිදුව තබන්න\n• ධාන්‍ය භ්‍රමණය දැඩිව ක්‍රියාත්මක කරන්න",
        medium: "🦠 මධ්‍යම රෝග පාලනය:\n\n• කාබනික දිලීර නාශක භාවිත කරන්න\n• රෝග ප්‍රතිරෝධී ප්‍රභේද ස්ථාපනය කරන්න\n• වැළැක්වීමේ ජෛව දිලීර නාශක\n• නිතිපතා අධීක්ෂණය සහ විමර්ශනය\n• රෝග රහිත සහතික කළ බීජ\n• නිසි සනීපාරක්ෂාව ක්‍රියාත්මක කරන්න",
        high: "🦠 උසස් රෝග කළමණාකරණය:\n\n• වෘත්තීය රෝග රෝග විනිශ්චය\n• හරිතාගාර නිෂ්පාදන පද්ධති\n• උසස් ජෛව පාලන කාරක\n• දේශගුණ පාලිත පරිසර\n• නිරවද්‍ය යෙදුම් තාක්ෂණය\n• රෝග පුරෝකථන පද්ධති",
      },
      "yield improvement": {
        low: "📈 අඩු වියදමින් අස්වැන්න වැඩි කරන්න:\n\n• ශාක පරතරය ප්‍රශස්ත කරන්න\n• දුර්වල පැළ ඉක්මනින් ඉවත් කරන්න\n• අනුක්‍රමික රෝපණය ක්‍රියාත්මක කරන්න\n• හිරු එළිය උපරිම කරන්න\n• සහකාරී රෝපණය නුවණින් භාවිත කරන්න\n• හොඳම බීජ ඉතිරි කර තෝරන්න",
        medium: "📈 මධ්‍යම අස්වැන්න වැඩි කිරීම:\n\n• ඉහළ අස්වැන්නක් දෙන දෙමුහුන් ප්‍රභේද\n• නිසි ජලාභරණ කාලසටහන්\n• සමබර පොහොර යෙදීම\n• පේළි ආවරණ සහ මල්චිං භාවිත කරන්න\n• අනුප්‍රාප්තික රෝපණය ක්‍රියාත්මක කරන්න\n• pH මට්ටම් අධීක්ෂණය සහ සකස් කරන්න",
        high: "📈 උපරිම අස්වැන්න උපාය මාර්ගය:\n\n• හරිතාගාර වගා පද්ධති\n• ජල වගාව හෝ මත්ස්‍ය වගාව\n• දේශගුණ පාලිත පරිසර\n• නිරවද්‍ය කෘෂිකර්ම තාක්ෂණය\n• වෘත්තීය බෝග උපදේශනය\n• උසස් අභිජනන තෝරාගැනීම්",
      },
      "seasonal planning": {
        low: "📅 සෘතු සැලසුම් ඉඟි:\n\n• සාම්ප්‍රදායික රෝපණ දින දර්ශනය අනුගමනය කරන්න\n• හොඳම පැලවලින් බීජ ඉතිරි කරන්න\n• වාර්ෂිකව ධාන්‍ය භ්‍රමණය සැලසුම් කරන්න\n• වැඩි දියුණු කළ තවානෙහි පැළ ආරම්භ කරන්න\n• දේශීය කාලගුණ රටා භාවිත කරන්න\n• කලින් ඉඩම සකස් කරන්න",
        medium: "📅 ව්‍යුහගත සෘතු සැලැස්ම:\n\n• කාලගුණ යෙදුම් සහ පුරෝකථන භාවිත කරන්න\n• විස්තරාත්මක රෝපණ කාලසටහන් සාදන්න\n• වාර දීර්ඝ කිරීමේ මෙවලම්වලට ආයෝජනය\n• වෙළඳපල ඉල්ලුම් කාලය සඳහා සැලසුම් කරන්න\n• සෘතුවට පෙර පාංශු යෝජනා භාවිත කරන්න\n• වැඩිදියුණු කිරීම සඳහා ප්‍රතිඵල ලේඛනගත කරන්න",
        high: "📅 උසස් සෘතු උපාය මාර්ගය:\n\n• දේශගුණ දත්ත විශ්ලේෂණ\n• වෘත්තීය කෘෂිකර්ම විද්‍යාඥ උපදේශනය\n• වසර පුරා නිෂ්පාදනය සඳහා හරිතාගාර\n• වෙළඳපල විශ්ලේෂණ ඒකාබද්ධතාවය\n• ස්වයංක්‍රීය පාරිසරික පාලන\n• බහු-සෘතු සැලසුම් මෘදුකාංග",
      },
      "grow carrots": {
        low: "🥕 ගෙඩි වගා කරන්නේ කෙසේද - අඩු වියදමින්:\n\n1. හිරු එළිය ලබන තැනක් තෝරන්න, ලිහිල්, වැලි පස් (pH 6.0-6.8).\n2. අන්තිම සීතලයට පෙර සති 4-6කින් බීජ 1/4 අඟල් ගැඹුරින්, 1/2 අඟල් පරතරයෙන්, පේළි 12 අඟල් පරතරයෙන් වසන්න.\n3. පස් තෙත්ව තබා ජලය දෙන්න; තෙතමනය රඳවා ගැනීමට මල්චිං භාවිත කරන්න.\n4. 2 අඟල් උස වන විට පැළ 3 අඟල් පරතරයට තෝරන්න.\n5. දින 60-80කින් 1/2-1 අඟල් දියමන වන විට අස්වැන්න ගන්න.\n\nඉඟිය: පේළි සලකුණු කිරීමට රැඩිෂ් බීජ මිශ්‍ර කරන්න.",
        medium: "🥕 ගෙඩි වගා කරන්නේ කෙසේද - මධ්‍යම වියදමින්:\n\n1. ගැඹුරු කර ගෙඩි එකතු කර පස් සකස් කරන්න.\n2. හොඳ ජලාපවහනය සඳහා උස් ඇඳන්හි වසන්න; සමාන පරතරය සඳහා බීජ ටේප් භාවිත කරන්න.\n3. ස්ථිර තෙතමනය සඳහා ටිප් ජලාභරණය ස්ථාපනය කරන්න.\n4. බිඳීම වැළැක්වීමට මුල් වටා පස් ගොඩගසන්න.\n5. සමබර කාබනික NPK සමඟ සැහැල්ලු පොහොර.\n6. අඛණ්ඩ සැපයුම සඳහා තෝරාගෙන අස්වැන්න ගන්න.",
        high: "🥕 ගෙඩි වගා කරන්නේ කෙසේද - ඉහළ වියදමින්:\n\n1. පාලිත හරිතාගාර පරිසරයක නිරවද්‍ය බීජකරන් භාවිත කරන්න.\n2. pH සහ තෙතමනය සඳහා සංවේදකවලින් පස් අධීක්ෂණය කරන්න.\n3. අභිරුචි පෝෂක සමඟ පොහොර ජලාභරණය යෙදන්න.\n4. රෝග ප්‍රතිරෝධී ප්‍රභේද සහ IPM සඳහා පළිබෝධ.\n5. ස්වයංක්‍රීය මෙවලම්වලින් අස්වැන්න ගන්න; දේශගුණ පාලිත තත්ත්වයන්හි ගබඩා කරන්න.\n\nබලාපොරොත්තු වන අස්වැන්න: උපරිම කළමනාකරණය සමඟ ගිගවල් 20/එකරය.",
      },
    },
  };

  // Expanded quick questions with categories
  const quickQuestions = {
    english: {
      "Soil & Nutrition": [
        "How to improve soil health?",
        "Best organic fertilizers?",
        "Crop nutrition tips?",
        "Composting methods?"
      ],
      "Water & Irrigation": [
        "Water management tips?",
        "Drip irrigation setup?",
        "Rainwater harvesting?",
        "Irrigation scheduling?"
      ],
      "Pests & Diseases": [
        "Organic pest control?",
        "What are remedies for pests?",
        "Disease prevention?",
        "Natural pesticides?"
      ],
      "Farming Practices": [
        "How to grow carrots?",
        "Organic farming methods?",
        "Yield improvement tips?",
        "Seasonal planning?"
      ]
    },
    sinhala: {
      "පස හා පෝෂණය": [
        "පාංශු සෞඛ්‍යය වැඩි දියුණු කරන්නේ කෙසේද?",
        "හොඳම කාබනික පොහොර?",
        "බෝග පෝෂණ උපදෙස්?",
        "කොම්පෝස්ට් ක්‍රම?"
      ],
      "ජලය හා ජලාභරණය": [
        "ජල කළමණාකරණ උපදෙස්?",
        "ටිප් ජලාභරණය සකස් කරන්නේ කෙසේද?",
        "වැසි ජල එකතු කිරීම?",
        "ජලාභරණ කාලසටහන්?"
      ],
      "පළිබෝධ හා රෝග": [
        "කාබනික පළිබෝධ පාලනය?",
        "පළිබෝධ සඳහා උපදෙස් මොනවාද?",
        "රෝග වැළැක්වීම?",
        "ස්වාභාවික කෘමිනාශක?"
      ],
      "ගොවිතැන් භාවිතයන්": [
        "ගෙඩි වගා කරන්නේ කෙසේද?",
        "කාබනික ගොවිතැන් ක්‍රම?",
        "අස්වැන්න වැඩි කරන උපදෙස්?",
        "සෘතු සැලසුම්?"
      ]
    }
  };

  // Agriculture-related keywords
  const agriKeywords = [
    "soil", "water", "crop", "plant", "grow", "pest", "disease", "fertilizer", "irrigation", "yield", "organic", "farming", "harvest", "seed", "compost",
    "පස", "ජල", "බෝග", "වගා", "පළිබෝධ", "රෝග", "පොහොර", "ජලාභරණ", "අස්වැන්න", "කාබනික", "ගොවිතැන්", "අස්වැන්න", "බීජ", "කොම්පෝස්ට්"
  ];

  const isAgricultureRelated = (question) => {
    const lowerQuestion = question.toLowerCase();
    return agriKeywords.some(keyword => lowerQuestion.includes(keyword));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAdvice = (question) => {
    const questionLower = question.toLowerCase();
    let category = null;

    if (!isAgricultureRelated(question)) {
      return language === "english"
        ? "❌ Sorry, this question appears unrelated to agriculture. Please ask about farming, crops, soil, pests, or related topics for expert advice."
        : "❌ කණගාටුයි, මෙම ප්‍රශ්නය කෘෂිකර්ම සම්බන්ධ නොවේ. වගාව, බෝග, පස, පළිබෝධ හෝ සම්බන්ධ මාතෘකාවන් ගැන විමසන්න විශේෂඥ උපදෙස් සඳහා.";
    }

    // Specific question matching
    if (questionLower.includes("grow carrots") || questionLower.includes("carrots") || questionLower.includes("ගෙඩි")) {
      category = "grow carrots";
    } else if (questionLower.includes("soil") || questionLower.includes("පස") || questionLower.includes("පාංශු") || questionLower.includes("nutrition") || questionLower.includes("පෝෂණ") || questionLower.includes("fertilizer") || questionLower.includes("compost")) {
      category = "soil health";
    } else if (questionLower.includes("water") || questionLower.includes("irrigation") || questionLower.includes("ජල") || questionLower.includes("drip") || questionLower.includes("rain")) {
      category = "water management";
    } else if (questionLower.includes("pest") || questionLower.includes("පළිබෝධ") || questionLower.includes("insect") || questionLower.includes("කෘමි") || questionLower.includes("remedies for pest") || questionLower.includes("පළිබෝධ සඳහා උපදෙස්")) {
      category = "pest control";
    } else if (questionLower.includes("disease") || questionLower.includes("රෝග") || questionLower.includes("fungus")) {
      category = "disease management";
    } else if (questionLower.includes("yield") || questionLower.includes("අස්වැන්න") || questionLower.includes("production") || questionLower.includes("improve")) {
      category = "yield improvement";
    } else if (questionLower.includes("season") || questionLower.includes("සෘතු") || questionLower.includes("planning") || questionLower.includes("rotation")) {
      category = "seasonal planning";
    } else if (questionLower.includes("crop nutrition") || questionLower.includes("බෝග පෝෂණ")) {
      category = "crop nutrition";
    } else {
      category = "organic farming";
    }

    if (category && adviceDatabase[language][category] && adviceDatabase[language][category][budgetLevel]) {
      return adviceDatabase[language][category][budgetLevel];
    } else {
      return language === "english"
        ? "I'm here to help! Please ask about soil health, water management, pest control, disease management, crop nutrition, yield improvement, growing carrots, or seasonal planning."
        : "මම ඔබට උදව් කිරීමට මෙහි සිටිමි! පාංශු සෞඛ්‍යය, ජල කළමණාකරණය, පළිබෝධ පාලනය, රෝග කළමණාකරණය, බෝග පෝෂණය, අස්වැන්න වැඩි කිරීම, ගෙඩි වගාව, හෝ සෘතු සැලසුම් පිළිබඳව අසන්න.";
    }
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: currentMessage,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const advice = generateAdvice(userMessage.content);
      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: advice,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1200);
  };

  const handleQuickQuestion = (question) => {
    setCurrentMessage(question);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: "bot",
        content:
          language === "english"
            ? "Chat cleared! How can I help you today? 🌾"
            : "කතාබහ මකා දමන ලදී! අද මට ඔබට කෙසේ උදව් කළ හැකිද? 🌾",
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const budgetOptions = {
    english: [
      { value: "low", label: "Low Budget", sublabel: "< Rs. 10,000", icon: "💰" },
      { value: "medium", label: "Medium Budget", sublabel: "Rs. 10,000 - 50,000", icon: "💰💰" },
      { value: "high", label: "High Budget", sublabel: "> Rs. 50,000", icon: "💰💰💰" }
    ],
    sinhala: [
      { value: "low", label: "අඩු වියදම", sublabel: "< රු. 10,000", icon: "💰" },
      { value: "medium", label: "මධ්‍යම වියදම", sublabel: "රු. 10,000 - 50,000", icon: "💰💰" },
      { value: "high", label: "ඉහළ වියදම", sublabel: "> රු. 50,000", icon: "💰💰💰" }
    ]
  };

  return (
    <>
      <Helmet><title>AgroSphere | Advisor</title></Helmet>
      <Header />
    <div className="advisor-page">
      <div className="advisor-container">
        {/* Header */}
        <div className="advisor-header">
          <div className="header-top">
            <div className="header-left">
              <button className="back-btn" onClick={() => navigate(-1)}>
                ← Back
              </button>
              <div>
                <h1 className="advisor-title">
                  🌾 {language === "english" ? "Agricultural Advisor" : "කෘෂිකර්ම උපදේශකයා"}
                </h1>
                <p className="advisor-subtitle">
                  {language === "english" ? "Your Smart Farming Assistant" : "ඔබේ ස්මාර්ට් ගොවිතැන් සහායකයා"}
                </p>
              </div>
            </div>
            
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="language-select"
            >
              <option value="english">English</option>
              <option value="sinhala">සිංහල</option>
            </select>
          </div>

          {/* Budget Selector */}
          <div className="budget-selector">
            <h3 className="budget-title">
              📊 {language === "english" ? "Select Your Budget Level:" : "ඔබේ අයවැය මට්ටම තෝරන්න:"}
            </h3>
            <div className="budget-options">
              {budgetOptions[language].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setBudgetLevel(option.value)}
                  className={`budget-btn ${budgetLevel === option.value ? 'active' : 'inactive'}`}
                >
                  <span className="budget-icon">{option.icon}</span>
                  <div className="budget-text">
                    <div className="budget-label">{option.label}</div>
                    <div className="budget-sublabel">{option.sublabel}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="advisor-grid">
          {/* Chat Section */}
          <div className="chat-section">
            <div className="chat-container">
              {/* Messages */}
              <div className="messages-area">
                {messages.map((msg) => (
                  <div key={msg.id} className={`message-wrapper ${msg.type}`}>
                    <div className={`message ${msg.type}`}>
                      <div className="message-text">{msg.content}</div>
                      <div className="message-time">{msg.timestamp}</div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="message-wrapper bot">
                    <div className="message bot">
                      <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="input-section">
                <div className="input-row">
                  <textarea
                    className="message-input"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={language === "english" ? "Ask your farming question..." : "ඔබේ ගොවිතැන් ප්‍රශ්නය ඇසන්න..."}
                    rows={2}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim()}
                    className="send-btn"
                  >
                    🚀
                  </button>
                </div>
                <div className="button-row">
                  <button onClick={clearChat} className="clear-btn">
                    🗑️ {language === "english" ? "Clear Chat" : "කතාබහ මකන්න"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Questions Panel */}
          <div className="quick-questions-panel">
            {Object.entries(quickQuestions[language]).map(([category, questions]) => (
              <div key={category} className="question-category">
                <h3 className="category-title">
                  {category === "Soil & Nutrition" || category === "පස හා පෝෂණය" ? "🌱" :
                   category === "Water & Irrigation" || category === "ජලය හා ජලාභරණය" ? "💧" :
                   category === "Pests & Diseases" || category === "පළිබෝධ හා රෝග" ? "🐛" : "🌾"}
                  {" "}{category}
                </h3>
                <div className="question-list">
                  {questions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickQuestion(q)}
                      className="question-btn"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Info Card */}
            <div className="info-card">
              <div className="info-card-content">
                <span className="info-icon">💡</span>
                <div>
                  <h4 className="info-title">
                    {language === "english" ? "Pro Tip" : "වැදගත් උපදෙස"}
                  </h4>
                  <p className="info-text">
                    {language === "english" 
                      ? "Adjust your budget level above to get personalized advice that matches your investment capacity!"
                      : "ඔබේ ආයෝජන ධාරිතාවයට ගැලපෙන පුද්ගලික උපදෙස් ලබා ගැනීමට ඉහත ඔබේ අයවැය මට්ටම සකස් කරන්න!"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
    </>
  );
};

export default Advisor;