/* CHEMVisual shared features: offline-first, i18n, AI doubts (offline rule-based), voice, low-bandwidth lite */
(function () {
  'use strict';
  var LS_LANG = 'chemLang', LS_LITE = 'chemLite', LS_DOUBTS = 'chemDoubts';

  /* ---------- 1. Offline-first: register SW + online badge ---------- */
  if ('serviceWorker' in navigator && /^https?:|^file:/.test(location.protocol) !== false) {
    try {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    } catch (_) {}
  }
  function toast(msg) {
    var t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;left:50%;bottom:76px;transform:translateX(-50%);background:#1a3000;color:#fff;padding:9px 14px;border-radius:10px;font-size:.82rem;font-weight:700;z-index:9999;box-shadow:0 6px 18px rgba(0,0,0,.3);opacity:0;transition:opacity .3s';
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.style.opacity = '1'; });
    setTimeout(function () { t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 400); }, 2600);
  }

  /* ---------- 2. Regional language support (EN / HI / TA) ---------- */
  var STR = {
    en: { toolbar:'Learning tools', lang:'Language', lite:'Lite mode', online:'Online', offline:'Offline — saved lessons still work', refreshNote:'⚠️ Please refresh the page after switching languages as it may get stuck', ask:'Ask Doubt', askPh:'Type your doubt… e.g. why lime water turns milky?', send:'Ask', mic:'Speak', speak:'Listen', close:'Close', offlineReady:'Offline ready — lessons saved on this device', liteOn:'Lite mode ON — animations off, low data', liteOff:'Full visuals ON', nomatch:'I could not find that in your practicals. Try words like pH, titration, FeS, CuCO3, KMnO4, or salt analysis.', aiVoice:'(offline AI + voice)', voiceNo:'Voice not supported in this browser — type instead' },
    hi: { toolbar:'सीखने के उपकरण', lang:'भाषा', lite:'लाइट मोड', online:'ऑनलाइन', offline:'ऑफ़लाइन — सहेजे गए पाठ चलेंगे', refreshNote:'⚠️ भाषा बदलने के बाद कृपया पेज रिफ्रेश करें क्योंकि यह अटक सकता है', ask:'शंका पूछें', askPh:'अपनी शंका लिखें… जैसे चूने का पानी दूधिया क्यों?', send:'पूछें', mic:'बोलें', speak:'सुनें', close:'बंद करें', offlineReady:'ऑफ़लाइन तैयार — पाठ इस डिवाइस में सहेजे गए', liteOn:'लाइट मोड चालू — एनिमेशन बंद, कम डेटा', liteOff:'पूरे विज़ुअल चालू', nomatch:'यह आपके प्रयोगों में नहीं मिला। pH, अनुमापन, FeS, CuCO3, KMnO4 जैसे शब्द लिखें।', aiVoice:'(ऑफ़लाइन AI + आवाज़)', voiceNo:'इस ब्राउज़र में आवाज़ समर्थित नहीं है — लिखकर पूछें' },
    ta: { toolbar:'கற்றல் கருவிகள்', lang:'மொழி', lite:'லைட் பயன்முறை', online:'ஆன்லைன்', offline:'ஆஃப்லைன் — சேமித்த பாடங்கள் வேலை செய்யும்', refreshNote:'⚠️ மொழியை மாற்றிய பிறகு பக்கத்தைப் புதுப்பிக்கவும், இல்லையேல் சிக்கிக்கொள்ளலாம்', ask:'சந்தேகம் கேளுங்கள்', askPh:'சந்தேகத்தை எழுதுக… சுண்ணாம்பு நீர் ஏன் பால் போல?', send:'கேள்', mic:'பேசுங்கள்', speak:'கேளுங்கள்', close:'மூடு', offlineReady:'ஆஃப்லைன் தயார் — பாடங்கள் சேமிக்கப்பட்டன', liteOn:'லைட் பயன்முறை ON — அனிமேஷன் இல்லை', liteOff:'முழு காட்சி ON', nomatch:'உங்கள் பரிசோதனைகளில் இது இல்லை. pH, titration, FeS, CuCO3 போன்ற சொற்களை முயலுக.', aiVoice:'(ஆஃப்லைன் AI + குரல்)', voiceNo:'இந்த உலாவியில் குரல் இல்லை — எழுதிக் கேளுங்கள்' }
  };
  function lang() { try { return localStorage.getItem(LS_LANG) || 'en'; } catch (_) { return 'en'; } }
  function T(k) { var l = lang(); return (STR[l] && STR[l][k]) || STR.en[k] || k; }
  function speechLang() { return lang() === 'hi' ? 'hi-IN' : lang() === 'ta' ? 'ta-IN' : 'en-IN'; }

  // Full-page dictionaries: every visible string is translated via walker + observer.
  // Longest phrases first (sorted at init). Formulas (NaCl, H2SO4, pH, FeS…) have no entry so they stay intact.
  var DICT = {
    hi: [
      ['Visual Chemistry Lab','विज़ुअल रसायन प्रयोगशाला'],
      ['Enter your details to join the periodic party','आवर्त सारणी पार्टी से जुड़ने के लिए अपना विवरण भरें'],
      ['CBSE & ICSE Practical Handbook','CBSE व ICSE प्रायोगिक पुस्तिका'],
      ['Classes 9 to 12','कक्षा 9 से 12'],
      ['Search experiments','प्रयोग खोजें'],
      ['Loading student details','छात्र विवरण लोड हो रहा है'],
      ['Loading','लोड हो रहा है'],
      ['Back to Registration','पंजीकरण पर वापस जाएँ'],
      ['Back to Experiments','प्रयोगों पर वापस जाएँ'],
      ['Reagents & Amounts','अभिकर्मक व मात्राएँ'],
      ['Precautions & Result','सावधानियाँ व परिणाम'],
      ['Precaution','सावधानी'],
      ['Observation log','प्रेक्षण लॉग'],
      ['tap to expand','खोलने के लिए टैप करें'],
      ['Finish Practical','प्रयोग समाप्त करें'],
      ['Start Practical','प्रायोगिक कार्य शुरू करें'],
      ['Reset Bench','बेंच रीसेट करें'],
      ['Lab Bench','लैब बेंच'],
      ['click equipment to use it','उपकरण उपयोग करने के लिए क्लिक करें'],
      ['Interactive practical bench','इंटरैक्टिव प्रायोगिक बेंच'],
      ['Procedure','विधि'],
      ['how this practical works','यह प्रयोग कैसे करें'],
      ['Heating time','तापन समय'],
      ['sec per click','प्रति क्लिक सेकंड'],
      ['Reagent / solution','अभिकर्मक / विलयन'],
      ['Add to Vessel','बर्तन में डालें'],
      ['Stir / Shake','मिलाएँ / हिलाएँ'],
      ['Burner','बर्नर'],
      ['Student Name','छात्र का नाम'],
      ['Select Board','बोर्ड चुनें'],
      ['Choose your board','अपना बोर्ड चुनें'],
      ['State Board','राज्य बोर्ड'],
      ['Select Class','कक्षा चुनें'],
      ['Choose your class','अपनी कक्षा चुनें'],
      ['Enter the Lab','प्रयोगशाला में प्रवेश करें'],
      ['Opening your lab','आपकी प्रयोगशाला खुल रही है'],
      ['Lab Safety','प्रयोगशाला सुरक्षा'],
      ['Secondary & Senior Secondary','माध्यमिक व उच्च माध्यमिक'],
      ['Observation','प्रेक्षण'],
      ['Theory','सिद्धांत'],
      ['Result','परिणाम'],
      ['Aim','उद्देश्य'],
      ['Safety','सुरक्षा'],
      ['Controls','नियंत्रण'],
      ['Amount','मात्रा'],
      ['Filter','छानें'],
      ['Volume','आयतन'],
      ['Temperature','तापमान'],
      ['Contents','सामग्री'],
      ['Progress','प्रगति'],
      ['empty','खाली'],
      ['Student','छात्र'],
      ['Board','बोर्ड'],
      ['Class','कक्षा'],
      ['Welcome','स्वागत है'],
      ['experiments','प्रयोग'],
      ['experiment','प्रयोग'],
      ['solution','विलयन'],
      ['suspension','निलंबन'],
      ['colloidal','कोलॉइडी'],
      ['precipitate','अवक्षेप'],
      ['titration','अनुमापन'],
      ['burette','ब्यूरेट'],
      ['flask','फ्लास्क'],
      ['beaker','बीकर'],
      ['test tube','परखनली'],
      ['test tubes','परखनलियां'],
      ['acid','अम्ल'],
      ['base','क्षार'],
      ['salt','लवण'],
      ['gas','गैस'],
      ['heat','गर्म करें'],
      ['stir','हिलाएँ'],
      ['filter paper','फिल्टर पेपर'],
      ['mixture','मिश्रण'],
      ['colour','रंग'],
      ['color','रंग'],
      ['water','पानी'],
      ['with','के साथ'],
      ['and','और'],
      ['or','या'],
      ['the',''],
      ['of','का'],
      ['to','को'],
      ['in','में'],
      ['on','पर'],
      ['for','के लिए']
    ],
    ta: [
      ['Visual Chemistry Lab','காட்சி வேதியியல் ஆய்வகம்'],
      ['Enter your details to join the periodic party','காலமுறை விருந்தில் சேர உங்கள் விவரங்களை நிரப்பவும்'],
      ['CBSE & ICSE Practical Handbook','CBSE & ICSE செய்முறை கையேடு'],
      ['Classes 9 to 12','வகுப்பு 9 முதல் 12'],
      ['Search experiments','பரிசோதனைகளைத் தேடுக'],
      ['Loading student details','மாணவர் விவரங்கள் ஏற்றப்படுகிறது'],
      ['Loading','ஏற்றுகிறது'],
      ['Back to Registration','பதிவுக்குத் திரும்பு'],
      ['Back to Experiments','பரிசோதனைகளுக்குத் திரும்பு'],
      ['Reagents & Amounts','வினைபொருள்கள் & அளவுகள்'],
      ['Precautions & Result','முன்னெச்சரிக்கை & முடிவு'],
      ['Precaution','முன்னெச்சரிக்கை'],
      ['Observation log','உற்றுநோக்கல் பதிவு'],
      ['tap to expand','விரிவாக்கத் தட்டுக'],
      ['Finish Practical','செய்முறையை நிறைவு செய்க'],
      ['Start Practical','செய்முறையைத் தொடங்கு'],
      ['Reset Bench','மேடையை மீட்டமைக்கவும்'],
      ['Lab Bench','ஆய்வக மேடை'],
      ['click equipment to use it','கருவிகளைப் பயன்படுத்தச் சொடுக்கவும்'],
      ['Interactive practical bench','ஊடாடும் ஆய்வு மேடை'],
      ['Procedure','செயல்முறை'],
      ['how this practical works','இந்தப் பரிசோதனையை எப்படிச் செய்வது'],
      ['Heating time','சூடாக்கும் நேரம்'],
      ['sec per click','ஒரு கிளிக்கிற்கு வினாடி'],
      ['Reagent / solution','வினைபொருள் / கரைசல்'],
      ['Add to Vessel','கலனில் சேர்க்கவும்'],
      ['Stir / Shake','கலக்கு / குலுக்கு'],
      ['Burner','அடுப்பு'],
      ['Student Name','மாணவர் பெயர்'],
      ['Select Board','வாரியத்தைத் தேர்ந்தெடுக்கவும்'],
      ['Choose your board','உங்கள் வாரியத்தைத் தேர்ந்தெடுக்கவும்'],
      ['State Board','மாநில வாரியம்'],
      ['Select Class','வகுப்பைத் தேர்ந்தெடுக்கவும்'],
      ['Choose your class','உங்கள் வகுப்பைத் தேர்ந்தெடுக்கவும்'],
      ['Enter the Lab','ஆய்வகத்தில் நுழையவும்'],
      ['Opening your lab','உங்கள் ஆய்வகம் திறக்கிறது'],
      ['Lab Safety','ஆய்வக பாதுகாப்பு'],
      ['Secondary & Senior Secondary','இடைநிலை & மேல்நிலை'],
      ['Observation','உற்றுநோக்கல்'],
      ['Theory','கோட்பாடு'],
      ['Result','முடிவு'],
      ['Aim','நோக்கம்'],
      ['Safety','பாதுகாப்பு'],
      ['Controls','கட்டுப்பாடுகள்'],
      ['Amount','அளவு'],
      ['Filter','வடிகட்டு'],
      ['Volume','கொள்ளளவு'],
      ['Temperature','வெப்பநிலை'],
      ['Contents','உள்ளடக்கம்'],
      ['Progress','முன்னேற்றம்'],
      ['empty','காலி'],
      ['Student','மாணவர்'],
      ['Board','வாரியம்'],
      ['Class','வகுப்பு'],
      ['Welcome','வரவேற்கிறோம்'],
      ['experiments','பரிசோதனைகள்'],
      ['experiment','பரிசோதனை'],
      ['solution','கரைசல்'],
      ['suspension','தொங்கல்'],
      ['colloidal','கூழ்மம்'],
      ['precipitate','வீழ்படிவு'],
      ['titration','தரமறிதல்'],
      ['burette','பியூரெட்'],
      ['flask','குடுவை'],
      ['beaker','முகவை'],
      ['test tube','சோதனைக் குழாய்'],
      ['test tubes','சோதனைக் குழாய்கள்'],
      ['acid','அமிலம்'],
      ['base','காரம்'],
      ['salt','உப்பு'],
      ['gas','வாயு'],
      ['heat','சூடாக்குக'],
      ['stir','கலக்கு'],
      ['mixture','கலவை'],
      ['water','நீர்']
    ]
  };
  // Drop generic 'on' (clashes with Burner ON/OFF display); phrases below cover burner state.
  DICT.hi = DICT.hi.filter(function (e) { return e[0].toLowerCase() !== 'on'; });
  DICT.ta = DICT.ta.filter(function (e) { return e[0].toLowerCase() !== 'on'; });
  // Extra coverage so almost no English remains (sorted longest-first below).
  DICT.hi.push(['Do this','यह करें'],['You should see','आपको दिखेगा'],['Completes when you press','दबाने पर पूर्ण होता है'],['Get your things ready','अपना सामान तैयार करें'],['Take a clean','एक साफ़'],['Keep nearby','पास रखें'],['Stay safe','सुरक्षित रहें'],['Match the colours','रंगों का मिलान करें'],['Match the colors','रंगों का मिलान करें'],['Add and compare','डालें और तुलना करें'],['Add and stir','डालें और हिलाएँ'],['Heat and watch','गर्म करें और देखें'],['verified and completed','सत्यापित और पूर्ण हो गया'],['belongs to','का है'],['Mark done','पूर्ण चिह्नित करें'],['Undo','पूर्ववत करें'],['Skip','छोड़ें'],['Conical','शंक्वाकार'],['Burner: ON','बर्नर: चालू'],['Burner: OFF','बर्नर: बंद'],['OFF','बंद'],['Step','चरण'],['steps','चरण'],['No change','कोई बदलाव नहीं'],['Do not','मत'],['End point','अंतिम बिंदु'],['end point','अंतिम बिंदु'],['red','लाल'],['blue','नीला'],['green','हरा'],['yellow','पीला'],['orange','नारंगी'],['violet','बैंगनी'],['white','सफ़ेद'],['black','काला'],['brown','भूरा'],['pink','गुलाबी'],['milky','दूधिया'],['colourless','रंगहीन'],['colorless','रंगहीन'],['translucent','पारभासी'],['transparent','पारदर्शी'],['opaque','अपारदर्शी'],['cloudy','धुंधला'],['strong','मज़बूत'],['weak','कमज़ोर'],['dilute','तनु'],['fresh','ताज़ा'],['stale','बासी'],['hot','गर्म'],['cold','ठंडा'],['dry','सूखा'],['clean','साफ़'],['clear','साफ़'],['dirty','गंदा'],['neutral','उदासीन'],['acidic','अम्लीय'],['basic','क्षारीय'],['alkaline','क्षारीय'],['wash','धोएँ'],['dropper','ड्रॉपर'],['touch','छुएँ'],['strips','स्ट्रिप्स'],['strip','स्ट्रिप'],['careful','सावधान'],['carefully','सावधानी से'],['pop','पॉप'],['test','परीक्षण'],['give','देते हैं'],['gives','देता है'],['turn','बदलता है'],['turns','बदलता है'],['wait','प्रतीक्षा करें'],['keep','रखें'],['take','लें'],['press','दबाएँ'],['add','डालें'],['see','देखें'],['show','दिखाएँ'],['shows','दिखाता है'],['small','छोटा'],['nearby','पास में'],['complete','पूर्ण करें'],['completes','पूर्ण होता है'],['completed','पूर्ण हुआ'],['uniform','एकसमान'],['gently','धीरे से'],['slowly','धीरे-धीरे'],['shake','हिलाएँ'],['boil','उबालें'],['cool','ठंडा करें'],['pour','डालें'],['form','बनता है'],['forms','बनता है'],['formed','बना'],['appear','दिखाई देता है'],['appears','दिखाई देता है'],['smell','गंध'],['sound','आवाज़'],['residue','अवशेष'],['filtrate','निस्यंद'],['fumes','धुआँ'],['bubbles','बुलबुले'],['ring','छल्ला'],['mirror','दर्पण'],['ash','राख'],['crystals','क्रिस्टल'],['powder','चूर्ण'],['liquid','द्रव'],['solid','ठोस'],['taste','चखें'],['inhale','साँस में लें'],['spill','छलकना'],['burn','जलना'],['flame','लौ'],['never','कभी नहीं'],['always','हमेशा'],['before','पहले'],['after','बाद में'],['during','दौरान'],['again','फिर से'],['repeat','दोहराएँ'],['first','पहला'],['second','दूसरा'],['next','अगला'],['then','फिर'],['now','अब'],['should','चाहिए'],['must','अवश्य'],['can','सकते हैं'],['will','होगा'],['your','आपका'],['you','आप'],['observe','प्रेक्षण करें'],['observed','देखा गया'],['record','लिखें'],['compare','तुलना करें'],['match','मिलान करें'],['check','जाँचें'],['confirm','पुष्टि करें'],['confirmed','पुष्टि हुई'],['identify','पहचानें'],['detect','पता लगाएँ'],['measure','मापें'],['prepare','तैयार करें'],['separate','अलग करें'],['distinguish','अंतर बताएँ'],['order','क्रम'],['reactivity','अभिक्रियाशीलता'],['metals','धातुएँ'],['metal','धातु'],['sandpaper','रेगमाल'],['chart','चार्ट'],['handbook','पुस्तिका'],['below','नीचे'],['above','ऊपर'],['each','प्रत्येक'],['every','प्रत्येक'],['other','अन्य'],['same','वही'],['more','अधिक'],['very','बहुत'],['only','केवल'],['just','बस'],['not','नहीं'],['without','के बिना'],['between','बीच में'],['into','में'],['from','से'],['by','द्वारा'],['at','पर'],['as','के रूप में'],['is','है'],['are','हैं'],['was','था'],['be',''],['has','है'],['have','हैं'],['do','करें'],['does','करता है'],['did','किया'],['done','पूर्ण'],['what','क्या'],['why','क्यों'],['how','कैसे'],['when','कब'],['where','कहाँ'],['which','जो'],['this','यह'],['that','वह'],['these','ये'],['those','वे'],['it','यह'],['they','वे'],['we','हम'],['select','चुनें'],['choose','चुनें'],['min','मिनट'],['sec','सेकंड'],['time','समय'],['drop','बूँद'],['drops','बूँदें'],['paper','कागज़'],['rod','छड़'],['funnel','कीप'],['dish','पात्र'],['vessel','बर्तन'],['bench','बेंच'],['level','स्तर'],['mark','निशान'],['sample','नमूना'],['original','मूल'],['until','जब तक'],['while','जबकि'],['once','एक बार'],['open','खोलें'],['close','बंद करें'],['start','शुरू करें'],['stop','रोकें'],['finish','समाप्त करें'],['name','नाम'],['enter','दर्ज करें'],['wear','पहनें'],['cotton','सूती'],['coat','कोट'],['goggles','सुरक्षा चश्मा'],['remove','हटाएँ'],['rinse','खंगालें'],['mouth','मुँह'],['supervision','देखरेख'],['teacher','शिक्षक'],['under','अधीन'],['handle','संभालें'],['stirring','हिलाना'],['heating','गर्म करना'],['mixing','मिलाना'],['filtering','छानना'],['excess','आधिक्य'],['dropwise','बूँद-बूँद करके'],['permanent','स्थायी'],['faint','हल्का'],['dark','गहरा'],['dense','गाढ़ा'],['ready','तैयार'],['reset','रीसेट'],['back','वापस'],['eye','आँख'],['thermometer','थर्मामीटर'],['reads','बताता है'],['vapour','वाष्प'],['steam','भाप'],['using','उपयोग करके'],['use','उपयोग करें'],['used','उपयोग किया'],['changes','बदलता है'],['remains','बना रहता है'],['becomes','बन जाता है'],['starts','शुरू होता है'],['stops','रुकता है'],['away','दूर'],['fades','फीका पड़ता है'],['indicator','सूचक']);
  DICT.ta.push(['Do this','இதைச் செய்க'],['You should see','நீங்கள் காண்பீர்கள்'],['Completes when you press','அழுத்தினால் நிறைவடையும்'],['Get your things ready','பொருட்களைத் தயார் செய்க'],['Take a clean','சுத்தமான ஒன்றை எடுக்கவும்'],['Keep nearby','அருகில் வைக்கவும்'],['Stay safe','பாதுகாப்பாக இருங்கள்'],['Match the colours','நிறங்களை ஒப்பிடுக'],['Match the colors','நிறங்களை ஒப்பிடுக'],['Add and compare','சேர்த்து ஒப்பிடுக'],['Add and stir','சேர்த்துக் கலக்குக'],['Heat and watch','சூடாக்கி கவனிக்கவும்'],['verified and completed','சரிபார்த்து நிறைவு செய்யப்பட்டது'],['belongs to','சேர்ந்தது'],['Mark done','நிறைவு எனக் குறி'],['Undo','மீளமை'],['Skip','தவிர்'],      ['Conical','கூம்பு வடிவ'],['Burner: ON','அடுப்பு: இயக்கத்தில்'],['Burner: OFF','அடுப்பு: அணை'],['OFF','அணை'],['Step','படி'],['steps','படிகள்'],['No change','மாற்றம் இல்லை'],['Do not','வேண்டாம்'],['End point','முடிவுப் புள்ளி'],['end point','முடிவுப் புள்ளி'],['red','சிவப்பு'],['blue','நீலம்'],['green','பச்சை'],['yellow','மஞ்சள்'],['orange','ஆரஞ்சு'],['violet','ஊதா'],['white','வெள்ளை'],['black','கருப்பு'],['brown','பழுப்பு'],['pink','இளஞ்சிவப்பு'],['milky','பால் போன்ற'],['colourless','நிறமற்ற'],['colorless','நிறமற்ற'],['translucent','ஒளிகசியும்'],['transparent','ஒளிபுகும்'],['opaque','ஒளிபுகா'],['cloudy','கலங்கலான'],['strong','வலிமையான'],['weak','வலுவற்ற'],['dilute','நீர்த்த'],['fresh','புதிய'],['hot','சூடான'],['cold','குளிர்ந்த'],['dry','உலர்ந்த'],['clean','சுத்தமான'],['clear','தெளிவான'],['neutral','நடுநிலை'],['acidic','அமில'],['basic','கார'],['wash','கழுவுக'],['dropper','துளிசொட்டி'],['touch','தொடாதே'],['strips','துண்டுகள்'],['careful','கவனம்'],['pop','பாப் ஒலி'],['test','சோதனை'],['give','தருகின்றன'],['turn','மாறுகிறது'],['wait','காத்திருக்கவும்'],['keep','வை'],['take','எடு'],['press','அழுத்துக'],['add','சேர்க்கவும்'],['see','காண்க'],['show','காட்டு'],['small','சிறிய'],['complete','நிறைவு செய்க'],['completed','நிறைவடைந்தது'],['uniform','சீரான'],['gently','மெதுவாக'],['slowly','மெதுவாக'],['shake','குலுக்கு'],['boil','கொதிக்க வைக்கவும்'],['cool','குளிர்விக்கவும்'],['form','உருவாகிறது'],['appear','தோன்றுகிறது'],['smell','மணம்'],['sound','ஒலி'],['residue','எச்சம்'],['filtrate','வடிநீர்'],['fumes','புகை'],['bubbles','குமிழ்கள்'],['ring','வளையம்'],['mirror','ஆடி'],['ash','சாம்பல்'],['crystals','படிகங்கள்'],['powder','தூள்'],['liquid','திரவம்'],['solid','திடம்'],['taste','சுவை'],['flame','சுடர்'],['never','ஒருபோதும்'],['always','எப்போதும்'],['before','முன்'],['after','பின்'],['again','மீண்டும்'],['repeat','மீண்டும் செய்க'],['first','முதல்'],['second','இரண்டாம்'],['next','அடுத்த'],['then','பின்'],['now','இப்போது'],['should','வேண்டும்'],['must','கட்டாயம்'],['can','முடியும்'],['will','ஆகும்'],['your','உங்கள்'],['you','நீங்கள்'],['observe','உற்றுநோக்கு'],['observed','உற்றுநோக்கப்பட்டது'],['compare','ஒப்பிடு'],['match','பொருத்து'],['check','சரிபார்'],['confirm','உறுதி'],['confirmed','உறுதி'],['order','வரிசை'],['reactivity','வினைத்திறன்'],['metals','உலோகங்கள்'],['metal','உலோகம்'],['chart','அட்டவணை'],['handbook','கையேடு'],['below','கீழே'],['above','மேலே'],['each','ஒவ்வொரு'],['every','ஒவ்வொரு'],['other','மற்ற'],['same','அதே'],['more','மேலும்'],['very','மிக'],['only','மட்டும்'],['just','வெறும்'],['not','இல்லை'],['without','இன்றி'],['between','இடையே'],['into','உள்ளே'],['from','இருந்து'],['by','மூலம்'],['at','இல்'],['as','ஆக'],['is','ஆகும்'],['are','ஆகும்'],['was','இருந்தது'],['do','செய்'],['does','செய்கிறது'],['did','செய்தது'],['done','நிறைவு'],['what','என்ன'],['why','ஏன்'],['how','எப்படி'],['when','எப்போது'],['where','எங்கே'],['which','எது'],['this','இது'],['that','அது'],['these','இவை'],['those','அவை'],['it','இது'],['they','அவர்கள்'],['we','நாம்'],['select','தேர்ந்தெடு'],['choose','தேர்ந்தெடு'],['min','நிமிடம்'],['sec','வினாடி'],['time','நேரம்'],['drop','சொட்டு'],['paper','தாள்'],['rod','கோல்'],['funnel','புனல்'],['dish','தட்டு'],['vessel','கலன்'],['bench','மேடை'],['level','மட்டம்'],['mark','குறி'],['sample','மாதிரி'],['original','அசல்'],['until','வரை'],['once','ஒருமுறை'],['open','திற'],['close','மூடு'],['start','தொடங்கு'],['stop','நிறுத்து'],['finish','நிறைவு செய்க'],['name','பெயர்'],['enter','உள்ளிடு'],['wear','அணி'],['remove','நீக்கு'],['mouth','வாய்'],['teacher','ஆசிரியர்'],['under','கீழ்'],['ready','தயார்'],['reset','மீட்டமை'],['back','திரும்பு'],['eye','கண்'],['and','மற்றும்'],['or','அல்லது'],['with','உடன்'],['of','இன்'],['to','க்கு'],['in','இல்'],['for','க்காக'],['all','அனைத்து'],['no','இல்லை']);
  DICT.hi.push(['lemon juice','नींबू रस'],['lime water','चूने का पानी'],['acids','अम्ल'],['bases','क्षार']);
  DICT.ta.push(['lemon juice','எலுமிச்சைச் சாறு'],['lime water','சுண்ணாம்பு நீர்'],['acids','அமிலங்கள்'],['bases','காரங்கள்']);
  // Element / reagent names stay in English (user request) + formulas masked so
  // common-word replacement can never damage them (fixes "colourless"->"रंगless" class of bugs).
  var PROT_LOOSE = ['hydrogen','helium','lithium','beryllium','boron','carbon','nitrogen','oxygen','fluorine','neon','sodium','magnesium','aluminium','aluminum','silicon','phosphorus','sulfur','sulphur','chlorine','argon','potassium','calcium','scandium','titanium','vanadium','chromium','manganese','iron','cobalt','nickel','copper','zinc','gallium','germanium','arsenic','selenium','bromine','krypton','silver','tin','iodine','gold','mercury','lead','litmus','phenolphthalein','nessler','tollen','tollens','fehling','mohr','dnp'];
  var PROT_EXACT = ['He','Na','Mg','Al','Si','Cl','Ca','Fe','Cu','Zn','Ag','Au','pH'];
  var PROT_FORM = ['HCl','H2SO4','HNO3','NaOH','NaCl','Na2CO3','NaHCO3','CH3COOH','NH4Cl','NH4OH','CaCO3','CuSO4','FeSO4','ZnSO4','CuO','CuCO3','ZnO','FeS','FeCl3','BaCl2','AgNO3','AgCl','KMnO4','K2Cr2O7','Na2SO3','Na2S','ZnS','H2S','SO2','CO2','NH3','NO2','O2','H2','Cl2','N2','MgO','CuS','PbS','PbCl2','CS2','H2O','Ca(OH)2','Al(OH)3','Fe(OH)3','Pb(OH)2','Zn(OH)2'];
  function escRx(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function rxFor(en) {
    var pre = /^[A-Za-z0-9]/.test(en) ? '\\b' : '';
    var suf = /[A-Za-z0-9]$/.test(en) ? '\\b' : '';
    return new RegExp(pre + escRx(en) + suf, 'gi');
  }
  function maskProt(s) {
    var back = [], t = String(s), i, pat;
    for (i = 0; i < PROT_FORM.length; i++) {
      pat = new RegExp('\\b' + escRx(PROT_FORM[i]) + '\\b', 'g');
      t = t.replace(pat, function (m) { back.push(m); return '' + (back.length - 1) + ''; });
    }
    t = t.replace(/\b[A-Z][A-Za-z]*\d[\w()+.\-·]*/g, function (m) { back.push(m); return '' + (back.length - 1) + ''; });
    t = t.replace(/\b\d+\.?\d*\s*(?:M|mL|g|mg|L|°C)\b/g, function (m) { back.push(m); return '' + (back.length - 1) + ''; });
    for (i = 0; i < PROT_LOOSE.length; i++) {
      pat = new RegExp('\\b' + escRx(PROT_LOOSE[i]) + '\\b', 'gi');
      t = t.replace(pat, function (m) { back.push(m); return '' + (back.length - 1) + ''; });
    }
    for (i = 0; i < PROT_EXACT.length; i++) {
      pat = new RegExp('\\b' + escRx(PROT_EXACT[i]) + '\\b', 'g');
      t = t.replace(pat, function (m) { back.push(m); return '' + (back.length - 1) + ''; });
    }
    return { t: t, back: back };
  }
  function unmask(t, back) {
    return t.replace(/(\d+)/g, function (m, k) { return back[+k]; });
  }
  function translateString(s, l) {
    if (!s || l === 'en' || !DICT[l]) return s;
    var m = maskProt(s), out = m.t, i, pat;
    for (i = 0; i < DICT[l].length; i++) {
      var en = DICT[l][i][0], tr = DICT[l][i][1];
      if (!en) continue;
      pat = rxFor(en);
      if (pat.test(out)) { out = out.replace(pat, tr); pat.lastIndex = 0; }
    }
    out = unmask(out, m.back);
    return out.replace(/ {2,}/g, ' ').replace(/(\S)\s+([,;:.!?])/g, '$1$2');
  }
  // Remember English originals so switching languages never compounds translations
  var origText = new WeakMap(), origAttr = new WeakMap(), translating = false;
  function skipNode(node) {
    var el = node.nodeType === 1 ? node : node.parentElement;
    if (!el) return true;
    if (el.closest && el.closest('#cfBar,#cfPanel,script,style,noscript')) return true;
    return false;
  }
  function translateTextNode(node, l) {
    if (node.nodeType !== 3 || skipNode(node)) return;
    var v = node.nodeValue;
    if (!v || !/[A-Za-z]/.test(v) || !v.trim()) return;
    if (!origText.has(node)) origText.set(node, v);
    var src = origText.get(node);
    node.nodeValue = l === 'en' ? src : translateString(src, l);
  }
  function translateAttrs(root, l) {
    var els = (root.nodeType === 1 ? root.querySelectorAll('*') : []);
    var list = [];
    if (root.nodeType === 1) list.push(root);
    for (var i = 0; i < els.length; i++) list.push(els[i]);
    list.forEach(function (el) {
      if (el.closest && el.closest('#cfBar,#cfPanel')) return;
      ['placeholder', 'title', 'aria-label', 'alt'].forEach(function (at) {
        var cur = el.getAttribute && el.getAttribute(at);
        if (cur && /[A-Za-z]/.test(cur)) {
          var key = at + '::' + list.indexOf(el);
          if (!origAttr.has(el)) origAttr.set(el, {});
          var store = origAttr.get(el);
          if (!(at in store)) store[at] = cur;
          el.setAttribute(at, l === 'en' ? store[at] : translateString(store[at], l));
        }
      });
    });
  }
  function walkTranslate(l) {
    translating = true;
    try {
      var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      var nodes = [], n;
      while ((n = w.nextNode())) nodes.push(n);
      nodes.forEach(function (t) { translateTextNode(t, l); });
      translateAttrs(document.body, l);
      if (document.title && /[A-Za-z]/.test(document.title)) {
        if (!walkTranslate._t) walkTranslate._t = document.title;
        document.title = l === 'en' ? walkTranslate._t : translateString(walkTranslate._t, l);
      }
      try { document.documentElement.setAttribute('lang', l === 'hi' ? 'hi' : l === 'ta' ? 'ta' : 'en'); } catch (_) {}
    } finally { translating = false; }
  }
  var obsTimer = null;
  function observe() {
    if (!('MutationObserver' in window) || !document.body) return;
    var mo = new MutationObserver(function (muts) {
      if (translating) return;
      var l = lang();
      if (l === 'en') return;
      if (obsTimer) return;
      obsTimer = setTimeout(function () {
        obsTimer = null;
        translating = true;
        try {
          muts.forEach(function (m) {
            m.addedNodes.forEach(function (nd) {
              if (nd.nodeType === 3) translateTextNode(nd, l);
              else if (nd.nodeType === 1) {
                if (nd.matches && nd.matches('#cfBar,#cfPanel')) return;
                var w = document.createTreeWalker(nd, NodeFilter.SHOW_TEXT);
                var t, arr = [];
                while ((t = w.nextNode())) arr.push(t);
                arr.push.apply(arr, []);
                arr.forEach(function (x) { translateTextNode(x, l); });
                translateAttrs(nd, l);
              }
            });
            if (m.type === 'characterData' && m.target) translateTextNode(m.target, l);
          });
        } finally { translating = false; }
      }, 60);
    });
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  function applyLang() {
    var l = lang();
    document.querySelectorAll('[data-cf-t]').forEach(function (el) {
      var k = el.getAttribute('data-cf-t');
      el.textContent = T(k);
    });
    var ai = document.getElementById('cfAskInput');
    if (ai) ai.placeholder = T('askPh');
    var sel = document.getElementById('cfLang');
    if (sel) sel.value = l;
    var dot = document.getElementById('cfNetDot');
    if (dot) dot.textContent = (navigator.onLine ? '● ' + T('online') : '● ' + T('offline'));
    walkTranslate(l);
  }

  /* ---------- 3. Low-bandwidth lite mode ---------- */
  function liteOn() {
    try {
      if (localStorage.getItem(LS_LITE) === '1') return true;
      if (navigator.connection && navigator.connection.saveData) return true;
    } catch (_) {}
    return false;
  }
  function applyLite() {
    var on = liteOn();
    document.documentElement.classList.toggle('cf-lite', on);
    var b = document.getElementById('cfLite');
    if (b) { b.textContent = (on ? '☀ ' : '🍃 ') + T('lite') + (on ? ' ✓' : ''); b.setAttribute('aria-pressed', on ? 'true' : 'false'); }
  }
  var liteCss = document.createElement('style');
  liteCss.textContent = '.cf-lite .glow-cursor,.cf-lite .bubble,.cf-lite .bg-mol,.cf-lite .deco-bubble,.cf-lite .deco-flame{display:none!important}' +
    '.cf-lite *{animation-duration:.01s!important;transition-duration:.01s!important}' +
    '.cf-lite .elem,.cf-lite .inst{opacity:.6}' +
    '#cfBar{position:fixed;left:0;right:0;bottom:0;z-index:9000;display:flex;gap:8px;align-items:center;padding:8px 10px calc(8px + env(safe-area-inset-bottom,0px));background:rgba(20,25,10,.92);backdrop-filter:blur(8px);border-top:1px solid rgba(255,255,255,.15);font-size:.8rem;color:#fff}' +
    '#cfBar select,#cfBar button{border:none;border-radius:9px;padding:9px 12px;font-weight:800;font-size:.8rem;cursor:pointer;min-height:42px}' +
    '#cfBar select{background:#fff;color:#111}' +
    '#cfLite{background:#3A3405;color:#fff}' +
    '#cfAskFab{background:linear-gradient(90deg,#00897B,#558B2F);color:#fff;margin-left:auto}' +
    '#cfNetDot{font-size:.75rem;opacity:.9;white-space:nowrap}' +
    '#cfPanel{position:fixed;right:10px;left:10px;bottom:64px;z-index:9500;max-width:460px;margin-left:auto;background:#FFFEF7;color:#2E2A08;border:2px solid #D9C94A;border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.35);display:none;flex-direction:column;overflow:hidden}' +
    '#cfPanel.open{display:flex}' +
    '#cfPanel header{display:flex;gap:8px;align-items:center;padding:10px 12px;background:linear-gradient(90deg,#00897B,#558B2F);color:#fff;font-weight:800}' +
    '#cfLog{max-height:300px;overflow:auto;padding:10px;font-size:.85rem;line-height:1.5}' +
    '#cfLog .q{background:#FFF6C9;border:1px solid #D9C94A;border-radius:9px;padding:7px 9px;margin-bottom:6px}' +
    '#cfLog .a{background:#E8F5E9;border:1px solid #7AA93A;border-radius:9px;padding:7px 9px;margin-bottom:10px;white-space:pre-wrap}' +
    '#cfRow{display:flex;gap:6px;padding:8px;border-top:1px solid #D9C94A}' +
    '#cfAskInput{flex:1;border:1.5px solid #CFC15A;border-radius:9px;padding:10px;font-size:16px;min-width:0}' +
    '#cfRow button{background:#1a3000;color:#fff}' +
    '#cfLangNote{position:fixed;left:0;right:0;bottom:58px;z-index:8999;text-align:center;pointer-events:none}' +
    '#cfLangNote span{display:inline-block;background:rgba(20,25,10,.85);color:#FFD54F;border:1px solid rgba(255,213,79,.5);border-radius:999px;padding:4px 12px;font-size:.72rem;font-weight:700;box-shadow:0 4px 12px rgba(0,0,0,.25)}' +
    '@media(min-width:520px){#cfPanel{left:auto}}';
  document.head.appendChild(liteCss);

  /* ---------- 4. AI doubt resolution (100% offline, rule-based over your DATA) ---------- */
  function getData() {
    try { if (typeof DATA !== 'undefined' && DATA) return DATA; } catch (_) {}
    try { if (window.__DATA) return window.__DATA; } catch (_) {}
    return null;
  }
  function getExp() { try { if (typeof exp !== 'undefined' && exp) return exp; } catch (_) {} return null; }
  function answerDoubt(q) {
    q = (q || '').trim();
    if (!q) return '';
    var ql = q.toLowerCase();
    var D = getData(), cur = getExp();
    var l = lang();
    var prefix = l === 'hi' ? 'उत्तर: ' : l === 'ta' ? 'பதில்: ' : 'Answer: ';
    // Current experiment gets priority
    if (cur && /why|what|how|क्यों|क्या|कैसे|ஏன்|என்ன/.test(ql)) {
      var txt = (cur.title + ' ' + cur.aim + ' ' + cur.theory + ' ' + cur.obs + ' ' + cur.result).toLowerCase();
      var words = ql.split(/[^a-z\u0900-\u097F\u0B80-\u0BFF0-9+]+/).filter(function (w) { return w.length > 2; });
      if (words.some(function (w) { return txt.indexOf(w) !== -1; }) || ql.length < 30) {
        return prefix + cur.title + '\n• ' + cur.theory + '\n• You see: ' + cur.obs + '\n• Result: ' + cur.result;
      }
    }
    if (D) {
      var best = null, bestScore = 0;
      Object.keys(D).forEach(function (cls) {
        D[cls].forEach(function (e) {
          var hay = (e.title + ' ' + e.aim + ' ' + e.theory + ' ' + e.reagents).toLowerCase();
          var score = 0;
          ql.split(/[^a-z0-9+]+/).forEach(function (w) {
            if (w.length > 2 && hay.indexOf(w) !== -1) score += w.length;
          });
          if (score > bestScore) { bestScore = score; best = { cls: cls, e: e }; }
        });
      });
      if (best && bestScore >= 4) {
        return prefix + '[' + best.cls + ' Exp ' + best.e.no + '] ' + best.e.title +
          '\n• ' + best.e.theory + '\n• You see: ' + best.e.obs + '\n• Precaution: ' + best.e.precaution;
      }
    }
    // Generic chemistry fallbacks (offline knowledge)
    var KB = [
      [/lime.*milky|milky.*lime|co2/, 'CO2 + Ca(OH)2 → CaCO3 (white) + H2O. That white CaCO3 is the milkiness. Pass excess CO2 and it clears: CaCO3 + CO2 + H2O → Ca(HCO3)2 (soluble).'],
      [/brown ring|nitrate/, 'Brown ring: FeSO4 + NO + H2SO4 → brown [Fe(H2O)5(NO)]2+ ring at the junction. Use fresh FeSO4 and do NOT shake.'],
      [/titrat|phenolphthalein|end point/, 'Endpoint = first permanent faint pink (30 s). Overshoot (dark pink) → add acid back and repeat. Read lower meniscus; KMnO4 read upper meniscus.'],
      [/\bph\b|litmus/, 'pH paper: red 1–2 strong acid → orange → yellow → green 7 neutral → blue → violet 13–14 strong base. Never dip the strip into the bottle — use a dropper.'],
      [/fes|magnet|physical|chemical/, 'Fe + S mixed = still magnetic, S dissolves in CS2 (physical). Heat → black FeS, non-magnetic, insoluble (chemical change).'],
      [/cuco3|zinc nitrate|decompos/, 'CuCO3 (green) → CuO (black) + CO2. Zn(NO3)2 → ZnO + brown NO2 fumes + O2; ZnO is yellow when hot, white when cold.'],
      [/kmno4|mohr|fas/, 'KMnO4 vs Mohr salt needs excess dil H2SO4, else brown MnO2 ppt. Endpoint = permanent faint pink (self-indicator). M ≈ 0.01 M, strength ≈ 1.58 g/L.'],
      [/tollen|fehling|aldehyde|ketone/, 'Aldehyde: silver mirror (Tollen) + brick-red Cu2O (Fehling). Ketone: negative to both; both give yellow-orange with 2,4-DNP. Warm at 60 °C water bath, never boil.'],
      [/phenol|alcohol/, 'Alcohol: Na → H2 bubbles + fruity ester with acetic acid. Phenol: violet with neutral FeCl3 + pink with phthalic anhydride/NaOH.']
    ];
    for (var i = 0; i < KB.length; i++) if (KB[i][0].test(ql)) return prefix + KB[i][1];
    return T('nomatch');
  }
  function saveDoubt(q, a) {
    try {
      var h = JSON.parse(localStorage.getItem(LS_DOUBTS) || '[]');
      h.unshift({ q: q, a: a, when: Date.now() });
      localStorage.setItem(LS_DOUBTS, JSON.stringify(h.slice(0, 30)));
    } catch (_) {}
  }

  /* ---------- 5. Voice interaction (Web Speech API, offline-capable on device) ---------- */
  var rec = null, recOn = false;
  function toggleMic(input) {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast(T('voiceNo')); return; }
    if (recOn && rec) { try { rec.stop(); } catch (_) {} return; }
    rec = new SR();
    rec.lang = speechLang();
    rec.interimResults = false;
    recOn = true;
    input.placeholder = '🎙️ ' + T('mic') + '…';
    rec.onresult = function (e) {
      var txt = e.results[0][0].transcript;
      input.value = txt;
      recOn = false;
      input.placeholder = T('askPh');
      askFromInput();
    };
    rec.onend = function () { recOn = false; input.placeholder = T('askPh'); };
    rec.onerror = function () { recOn = false; input.placeholder = T('askPh'); };
    try { rec.start(); } catch (_) { recOn = false; }
  }
  function speak(text) {
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text.slice(0, 280));
      u.lang = speechLang();
      speechSynthesis.speak(u);
    } catch (_) {}
  }

  /* ---------- UI: bottom toolbar + doubt panel ---------- */
  function build() {
    if (document.getElementById('cfBar')) return;
    // Note shown above the language switcher: refresh after switching languages
    var langNote = document.createElement('div');
    langNote.id = 'cfLangNote';
    langNote.innerHTML = '<span data-cf-t="refreshNote">⚠️ Please refresh the page after switching languages as it may get stuck</span>';
    document.body.appendChild(langNote);
    var bar = document.createElement('div');
    bar.id = 'cfBar';
    bar.innerHTML = '<span id="cfNetDot">●</span>' +
      '<select id="cfLang" aria-label="Language"><option value="en">EN</option><option value="hi">हिंदी</option><option value="ta">தமிழ்</option></select>' +
      '<button id="cfLite" type="button"></button>' +
      '<button id="cfAskFab" type="button">💡 <span data-cf-t="ask">Ask Doubt</span> 🎙️</button>';
    document.body.appendChild(bar);

    var panel = document.createElement('div');
    panel.id = 'cfPanel';
    panel.innerHTML = '<header><span>💡</span><span data-cf-t="ask">Ask Doubt</span>' +
      '<span data-cf-t="aiVoice" style="font-weight:400;font-size:.72rem;opacity:.85">(offline AI + voice)</span>' +
      '<button id="cfClose" style="margin-left:auto;background:#fff;color:#111" type="button">✕</button></header>' +
      '<div id="cfLog"></div>' +
      '<div id="cfRow"><input id="cfAskInput" data-cf-t-ph="askPh"><button id="cfMic" title="Voice">🎙️</button><button id="cfSpeak" title="Listen">🔊</button><button id="cfSend" type="button">→</button></div>';
    document.body.appendChild(panel);

    var input = panel.querySelector('#cfAskInput'), logBox = panel.querySelector('#cfLog');
    try {
      var h = JSON.parse(localStorage.getItem(LS_DOUBTS) || '[]');
      h.slice(0, 5).reverse().forEach(function (it) {
        logBox.innerHTML += '<div class="q">❓ ' + escapeHtml(it.q) + '</div><div class="a">' + escapeHtml(it.a) + '</div>';
      });
    } catch (_) {}

    window.askFromInput = askFromInput;
    function askFromInput() {
      var q = input.value.trim();
      if (!q) return;
      var a = answerDoubt(q);
      var l = lang();
      if (l !== 'en') a = translateString(a, l);
      logBox.innerHTML += '<div class="q">❓ ' + escapeHtml(q) + '</div><div class="a">' + escapeHtml(a) + '</div>';
      logBox.scrollTop = logBox.scrollHeight;
      saveDoubt(q, a);
      input.value = '';
      speak(a);
    }
    panel.querySelector('#cfSend').onclick = askFromInput;
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') askFromInput(); });
    panel.querySelector('#cfMic').onclick = function () { toggleMic(input); };
    panel.querySelector('#cfSpeak').onclick = function () {
      var last = logBox.querySelector('.a:last-child');
      if (last) speak(last.textContent);
    };
    document.getElementById('cfAskFab').onclick = function () { panel.classList.toggle('open'); if (panel.classList.contains('open')) input.focus(); };
    panel.querySelector('#cfClose').onclick = function () { panel.classList.remove('open'); };

    document.getElementById('cfLang').onchange = function (e) {
      try { localStorage.setItem(LS_LANG, e.target.value); } catch (_) {}
      applyLang(); applyLite();
      toast(T('refreshNote'));
    };
    document.getElementById('cfLite').onclick = function () {
      try { localStorage.setItem(LS_LITE, liteOn() ? '0' : '1'); } catch (_) {}
      applyLite();
      toast(liteOn() ? T('liteOn') : T('liteOff'));
    };
    // Offline badge (offline-first proof)
    function net() {
      var d = document.getElementById('cfNetDot');
      if (d) { d.textContent = (navigator.onLine ? '● ' + T('online') : '● ' + T('offline')); d.style.color = navigator.onLine ? '#8BFF9E' : '#FFD54F'; }
    }
    window.addEventListener('online', function () { net(); toast(T('online')); });
    window.addEventListener('offline', function () { net(); toast(T('offline')); });
    net();
    // pad body so toolbar never covers Finish buttons
    document.body.style.paddingBottom = 'calc(' + getComputedStyle(document.body).paddingBottom + ' + 56px)';
    applyLang(); applyLite(); observe();
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
  // toast once when SW takes over (offline proof)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(function () { setTimeout(function () { toast(T('offlineReady')); }, 1200); }).catch(function () {});
  }
})();
