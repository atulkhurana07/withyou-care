import fs from "node:fs";
const tokens = JSON.parse(
  fs.readFileSync(
    new URL("../packages/design-tokens/tokens.json", import.meta.url),
    "utf8",
  ),
);
const dart = `// Generated from packages/design-tokens/tokens.json. Run npm run tokens.\nimport 'package:flutter/material.dart';\nclass WithYouColors {\n${Object.entries(
  tokens.color,
)
  .map(
    ([key, value]) => `  static const ${key} = Color(0xFF${value.slice(1)});`,
  )
  .join(
    "\n",
  )}\n}\nThemeData withYouTheme()=>ThemeData(\n useMaterial3:true, fontFamily:'Manrope', scaffoldBackgroundColor:WithYouColors.background,\n colorScheme:ColorScheme.fromSeed(seedColor:WithYouColors.primary,primary:WithYouColors.primary,surface:WithYouColors.surface),\n appBarTheme:const AppBarTheme(backgroundColor:WithYouColors.background,foregroundColor:WithYouColors.deep),\n textTheme:const TextTheme(bodyLarge:TextStyle(fontSize:16,height:1.6,color:WithYouColors.text),bodyMedium:TextStyle(fontSize:16,height:1.6,color:WithYouColors.secondary),headlineLarge:TextStyle(fontSize:40,height:1.15,fontWeight:FontWeight.w600,color:WithYouColors.deep),headlineMedium:TextStyle(fontSize:30,height:1.2,fontWeight:FontWeight.w600,color:WithYouColors.deep)),\n cardTheme:CardThemeData(color:WithYouColors.surface,elevation:0,shape:RoundedRectangleBorder(borderRadius:BorderRadius.circular(20),side:const BorderSide(color:WithYouColors.border))),\n inputDecorationTheme:InputDecorationTheme(filled:true,fillColor:WithYouColors.surface,border:OutlineInputBorder(borderRadius:BorderRadius.circular(12))),\n filledButtonTheme:FilledButtonThemeData(style:FilledButton.styleFrom(minimumSize:const Size(48,48),shape:RoundedRectangleBorder(borderRadius:BorderRadius.circular(12)))),\n);\n`;
fs.writeFileSync(
  new URL("../apps/patient-mobile/lib/theme.dart", import.meta.url),
  dart,
);
fs.writeFileSync(
  new URL("../packages/design-tokens/tokens.css", import.meta.url),
  `:root {\n${Object.entries(tokens.color)
    .map(([key, value]) => `  --${key}: ${value};`)
    .join("\n")}\n}\n`,
);
console.log("Generated web and Flutter tokens.");
