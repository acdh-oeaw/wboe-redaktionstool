export default {
	testXML: '<?xml version="1.0" encoding="UTF-8"?>				<?xml-model href="http://www.tei-c.org/release/xml/tei/custom/schema/relaxng/tei_all.rng" type="application/xml"					schematypens="http://purl.oclc.org/dsdl/schematron"?>				<?xml-model href="../803_RNG-schematron/WBOE-ODD.rnc" type="application/relax-ng-compact-syntax"?>				<TEI xmlns="http://www.tei-c.org/ns/1.0">				   <teiHeader>				      <fileDesc>				         <titleStmt>				           <title>Farz_AG_V1</title>				            <!-- add version in appropriate location-->				            <respStmt>				               <resp>Editor</resp>				               <name></name>				               <!-- Author of each article should enter name -->				            </respStmt>				            <respStmt>				               <resp>Encoding Scheme</resp>				               <name>Jack Bowers</name>				               <name>Daniel Schopper</name>				               <name>Omar Siam</name>				            </respStmt>				            <respStmt>				               <resp>DBOE Team</resp>				               <!-- editing tool UI should allow author to select their name from this static list and enter in value of //refStmt/name-->				               <name xml:id="AL">Alexandra N. Lenz</name>				               <name xml:id="PhS">Philip Stöckle</name>				               <name xml:id="AG">AndreasGellan</name>				               <name xml:id="PZ">Patrick Zeithuber</name>				               <name xml:id="SW">Sabine Wahl</name>				               <name xml:id="SS">Sonja Schwaiger</name>				               <name xml:id="JD">Jan Braun</name>				               <name xml:id="AB">Angela Bergmayer</name>				            </respStmt>				            <respStmt>				               <resp>Student assistants</resp>				               <name>EvaWahlmüller</name>				               <name>Susanna Muhr</name>				               <name>Alexandra Grohe</name>				               <name>Klemens Wagner</name>				            </respStmt>				            <!-- Include editor section add all editors names and initials somwhere in header and supplz initials for final line printout -->				         </titleStmt>				         <publicationStmt>				            <p>Publication Information</p>				            <!--NEED TO DECIDE ON WHAT TO PUT HERE -->				         </publicationStmt>				         <sourceDesc>				            <p>Information about the source</p>				            <!-- NEED TO DECIDE ON WHAT TO PUT HERE: Discuss in AG5 -->				         </sourceDesc>				      </fileDesc>				   </teiHeader>				   <text>				      <body>				         <entry>				            <form type="lemma">				               <orth>Farz</orth>				           </form>				            <form type="lemma">				               <orth>Pfarz</orth>				            </form>				            <gramGrp>				               <gram type="pos">Substantiv</gram>				               <gram type="gender">Masculinum</gram><!-- Formatting Rule: wrap value of //gram[@type=\'gender\'] in brackets -->				            </gramGrp>				            				            <form type="variant" subtype="diminutive" xml:id="Färzel"><!-- ISSUE: THESE CAN\'T BENESTED IN "LEMMA" BECAUSE THERE ARE TWO LEMMAS,  AND THEY ARE NOT ADJECENT TO EACH OF THEIR RESPECTIVE FORMS -->				               <orth>Färzel</orth>				               <gramGrp>				                  <!-- Formatting Rule: after (final) //form[@subtype=\'diminutive\'], print in brackets "(" "Diminutiv" comma "," value of /gram[@type=\'gender\'] ")"-->				                  <gram type="gender">Neutrum</gram><!-- Formatting Rule: wrap value of //gram[@type=\'gender\'] inbrackets -->				               </gramGrp>				            </form>				            <!-- Formatting Rule: if two consecutive //form contain the same value of /form/gramGrp/gram[@type=\'gender\'], only print the second  -->				            <form type="variant" subtype="diminutive" xml:id="Pfarzel">				               <orth>Pfarzel</orth>				               <gramGrp>				                  <!-- Formatting Rule: after (final) //form[@subtype=\'diminutive\'], print in brackets "(" "Diminutiv" comma "," value of /gram[@type=\'gender\'] ")"-->				                  <gram type="gender">Neutrum</gram><!-- Formatting Rule: wrap value of //gram[@type=\'gender\'] in brackets -->				               </gramGrp>				            </form>				         				            				            				            <!-- Formatting Rule: (Subheading)  "Verbreitung": before the first instance of: /entry/usg[@type = "geo"] -->				            <!-- Formatting Rule: insert semicolon ";" between each: /entry/usg[@type="geo"] -->				            <!-- Note: editor can replace <placeName type="grossregion"> with <placeName type="region"> if needed-->				            				            <usg type="geo"><placeName type="grossregion">STir.</placeName></usg>				            <usg type="geo"><placeName type="grossregion">Tir.</placeName></usg>				            <usg type="geo"><placeName type="grossregion">Ktn.</placeName></usg>				            <usg type="geo"><placeName type="grossregion">Stmk.</placeName></usg>				            <usg type="geo"><placeName type="grossregion">Lung.</placeName></usg>				            <usg type="geo"><placeName type="grossregion">Pinzg.</placeName></usg>				            <usg type="geo"><placeName type="grossregion">OÖ</placeName></usg>				            <usg type="geo"><placeName type="grossregion">Mostv.</placeName></usg>				            <usg type="geo"><placeName type="grossregion">Industriev.</placeName></usg>				            <usg type="geo"><placeName type="grossregion">Weinv.</placeName></usg>				            <usg type="geo"><placeName type="grossregion">Wien</placeName></usg>				            <!-- Formatting Rule: (Subheading)  "Belegauswahl": before the first form[@type = "lautung"] -->				            <!-- Formatting Rule: (Subheading)  "Datenbankbbeleg (exempl.)": before the first form[@type = "lautung"] -->				            <!-- Formatting Rule: surround /entry/form/usg[@type="geo"] contents with brackets "(" ")" -->				                        				               <form type="variant">				                  <!-- Formatting Rule: /form/pron in italics -->				                  <pron xml:lang="bar-AT">fǫšts</pron>				                  <usg type="geo"><!-- user delete the type of <placeName> not needed-->				                     <placeName>Ahrntal</placeName>				                     <placeName type="grossregion">öSTir.</placeName>				                  </usg>				               </form>				               				               <!-- Formatting Rule: semicolon between <form type="variant">\'s -->				               <form type="variant">				                  <pron xml:lang="bar-AT">fǫrts</pron>				                  				                  <usg type="geo">				                     <placeName>Lüsen</placeName>				                     <placeName type="grossregion">öSTir.</placeName>				                  </usg>				               </form>				            				            <!-- Formatting Rule: if two consecutive //form contain the same value of /form/usg[@type=\'geo\'], (rule 1)  Print "u." after /form[1] and (rule 2) only print /usg[@type=\'geo\'][2]-->				            <!-- formatting rule: where//form[@type=\'variant\'] has child  //form[@type=\'variant\']/form[@type=\'variant\' and @subtype] print "u." before the latter-->				            <form type="variant" subtype="diminutive">				               <pron xml:lang="bar-AT">fartsl</pron>				               				               <usg type="geo">				                  <placeName>Lüsen</placeName>				                  <placeName type="grossregion">öSTir.</placeName>				               </usg>				            </form>			               				               <form type="variant">				                  <pron xml:lang="bar-AT">lfǫχtß</pron><!-- NOTE: I coppied the word initial "l" but I think it\'s probably a typo!!! -->				                  <usg type="geo">				                     <placeName type="grossregion">Lung.</placeName>				                  </usg>				               </form>				            				            				            <!--Formatting Rule: print "Etymologie" before <etym> -->				            <!-- Formatting Rule: surround contents of <def> with single quotes (both in <sense> and in <etym>) -->				            <!-- Formatting Rule:  enter comma after <def> where //cit/desc -->				            <!--Formatting Rule:  add colon betweeen: (/date  or /edition>) and /citedRange within /bibl --> 				            <etym>				               <cit type="etymon">				                  <lang>mhd</lang>				                  <form>				                     <orth xml:lang="gmh">varz</orth>				                  </form>				                  <def>Darmwind</def>    				               </cit>				<ref type="bibl" target="#Lexer1878III"><citedRange>27</citedRange></ref>				            </etym>				            				            <!-- Formatting Rule: Print "Bedeutung" (project should only have one or the other!) -->				            <!-- Formatting Rule: where (2...n) <sense> for each print number in roman numerals with period -->				            <!-- Formatting Rule: where (2...n) <def> \'s in <sense> before each print number in arabic numerals with period -->				            <!-- Formatting Rule: surround contents of <def> with single quotes (both in <sense> and in <etym>) -->				            <!--Formatting Rule: letter spacing within def should be 1 pt --> 				            <!-- Formatting Rule: <cit type="example"><quote> in italics -->				            <!-- Formatting Rule: surround <cit type="example"><usg type="geo"> contents with brackets "(" ")" -->         				            <!-- Formatting Rule: add a long dash beforeeach //cit[@type="example"]  -->				            				            <sense>				               <!-- below is a preliminary attempt  -->				               <ref type="form">auch <oRef target="#Färzel"/><!-- Formatting rule: if target (/form[@type=\'variant\' and @subtype=\'diminutive] print "(Dim.)");--> </ref>				               <!-- auch Färzel (Dim.)  -->				               <def>Darmwind; Furz</def><usg type="geo"><placeName type="grossregion">STir.</placeName></usg>				               <usg type="geo"><placeName type="grossregion">Tir.</placeName></usg>				               <usg type="geo"><placeName type="grossregion">MKtn.</placeName></usg>				               <usg type="geo"><placeName type="grossregion">WStmk.</placeName></usg>				               <usg type="geo"><placeName type="grossregion">MStmk.</placeName></usg>				               <usg type="geo"><placeName type="grossregion">Lung.</placeName></usg>				               <usg type="geo"><placeName type="grossregion">OÖ</placeName></usg>				               <usg type="geo"><placeName type="grossregion">Weinv.</placeName></usg>				               <usg type="geo"><placeName type="grossregion">Wein.</placeName></usg> 				            </sense>				               				            <sense>				               <def>Kleinigkeit; Nichtigkeit</def>				              <usg type="geo"><placeName type="grossregion">öSTir.</placeName></usg>				               				               <cit type="example">				                  <quote xml:lang="bar-AT">pö̆gŋ an iǝdn fǫrts tsin dokχta špriŋ</quote>				                  <usg type="geo"><placeName>Lüsen</placeName><placeName type="grossregion">öSTir.</placeName></usg>				               </cit>				               				            </sense>				            				            <sense>				               <!-- below is a preliminary attempt  -->				               <ref type="form">auch <oRef target="#Pfarzel"/><!-- Formatting rule: if target (/form[@type=\'variant\' and @subtype=\'diminutive] print "(Dim.)");--> </ref>				               <!-- nur Pfarzel (Dim.)  -->				               <def>kleine Pfeife aus Weidenrinde</def>				               <usg type="geo"><placeName type="grossregion">Industriev.</placeName></usg>				            </sense>				            				               				               <!-- Formatting Rule: before variant in Wortbildung surround form with brackets and print \'auch\' before form -->				               <!-- Formatting Rule: insert "Wortbildung" before first <re> (same label for: compound, derivations, suffixes  -->				               <!-- Formatting Rule: <cit type="example"><quote> in italics -->				               <!-- Formatting Rule: surround <cit type="example"><usgtype="geo"> contents with brackets "(" ")" -->         				               <!-- Formatting Rule: add a long dash before each //cit[@type="example"]  --> 				            <!-- Formatting Rule: <re><orth> in italics -->				               <!-- Formatting Rule: surround contents of <def> with single quotes (both in <sense> and in <etym>) -->				            <re> 				               <form type="lemma" subtype="compound"><orth>Nonnenfarzel</orth></form>  				               <sense> 				                  <def>kleines Lebkuchenstücklein</def>				                  <!-- formatting Rule: wrap /usg[@type="dom"] in brackets -->				                  <usg type="dom">Klosterspeise</usg>				               </sense>				               <usg type="geo"><placeName type="grossregion">Stmk.</placeName></usg>				            </re>				            				            <re> 				               <form type="lemma" subtype="compound"><orth>Schneiderfarz</orth></form>  				               <usg type="geo"><placeName type="grossregion">Industriev.</placeName></usg>        				            </re>				              				            <!-- Formatting Rule: before variant in Wortbildung surround form with brackets and print \'auch\' before form -->				            <!-- Formatting Rule: insert "Redenwendung" before first //form[@type=\'MWE\'] -->				            				            <re> 				               <form type="lemma" subtype="MWE"><orth>der Farz ist des Bauches Arzt</orth></form>  				               <usg type="geo"><placeName type="grossregion">Ktn.</placeName></usg>				               <cit type="example">				                  <quote xml:lang="bar-AT">dér Fàrz ist \'s pauchis àrz</quote> 				                  <!-- Formatting Rule: where //ref[@type=\'bibl\'] followed by //usg[@type=\'geo\'], retrievebibl from pointer, print title, semi-colon ";" and place; wrap in brackets: (KÄRNTISCHES WB. 1862: 90, Ktn.) -->				                  <ref type="bibl" target="#KÄRNTISCHESWB1862"><citedRange>90</citedRange></ref>				                  <usg type="geo"><placeName type="grossregion">Ktn.</placeName></usg>				               </cit>				            </re>				            				            <re> 				               <form type="lemma" subtype="MWE"><orth>Er lässt alle Farzen gehen</orth></form>  				               <sense> 				                  <def>der Organist spielt mit allen gezogenen Registern</def>				               </sense>				               <cit type="example">				                  <quote xml:lang="bar-AT">Jetz låsst r af n Kchor owen widEr ålle Fårzn giehn</quote> 				                  <usg type="geo"><placeName>Matrei am Brenner</placeName><placeName type="grossregion">mNTir.</placeName></usg>				               </cit>				            </re>				            				            <re> 				               <form type="lemma" subtype="MWE"><orth>herumschießen wie der Farz in die/der/den Reite(rn)</orth></form>  <!-- format in source not finalized -->				               <sense> 				                  <def>geschäftig herumlaufen</def>				                  <usg type="reg">spöttisch</usg>				               </sense>				               <usg type="geo"><placeName type="grossregion">Mostv.</placeName></usg>				               <cit type="example">				                  <quote xml:lang="bar-AT">u͂mǝdú͂m šiǝssn wiǝ dǝ pfåǝtts in dǝ raittǝ</quote> 				                  <usg type="geo"><placeName>Herzogenburg</placeName><placeName type="grossregion">Mostv.</placeName></usg>				               </cit>				            </re>				            				            <re> 				               <form type="lemma" subtype="MWE"><orth>Man hat keinen Farz gehört</orth></form>  				               <sense> 				                  <def>es ist nichts von einer Angelegenheit bekannt geworden</def>				               </sense>				               <usg type="geo"><placeName type="grossregion">OTir.</placeName></usg>				               <cit type="example">				                  <quote xml:lang="bar-AT">Man hat kan Få\'z ghęat</quote> 				                  <usg type="geo">				                     <placeName>uIselt.</placeName>				                     <!-- Formatting Rule: if /usg[@type=\'geo\'/placeName[not(@)] print "u." between the values -->				                    <placeName>Lienz.Beck.</placeName>				                     <placeName type="grossregion">OTir.</placeName></usg>				               </cit>				            </re>				            				            <re> 				               <form type="lemma" subtype="MWE"><orth>Schwarz und Weiß / Pfarz und Scheiß</orth></form>  				               <sense> 				                 <!-- Formatting Rule: print value of /usg[@type=\'dom\'] in brackets  -->				                  <usg type="dom">Kinderreim</usg>				               </sense>				               <usg type="geo"><placeName type="grossregion">Hausrv.</placeName></usg>				               <cit type="example">				                  <quote xml:lang="bar-AT">schwoaz und weis / Bfoaz und Scheis</quote> 				                  <usg type="geo"><placeName>Linz</placeName><placeName type="grossregion">Hausrv.</placeName></usg>				               </cit>				            </re>				            <!-- ADD EDITOR ITITIALS HERE -->				         </entry>				    </body>				   </text>	</TEI>',
	testOptionObj: `<?xml version="1.0" encoding="UTF-8"?>
<objPaser>
	<xmlParserHeader>
		&lt;?xml version="1.0" encoding="UTF-8"?&gt;
		&lt;?xml-model href="http://www.tei-c.org/release/xml/tei/custom/schema/relaxng/tei_all.rng" type="application/xml" schematypens="http://purl.oclc.org/dsdl/schematron"?&gt;
		&lt;?xml-model href="../803_RNG-schematron/WBOE-ODD.rnc" type="application/relax-ng-compact-syntax"?&gt;
	</xmlParserHeader>
	<objPaserContent>
		<TEI xmlns="http://www.tei-c.org/ns/1.0">
			<teiHeader>
				<fileDesc>
					<titleStmt>
						<title objParserValue="edit required" objParserTitle="Titel"></title>
						<test objParserTag="canBeEmpty">Test für Tag der gelöscht wird wenn leer ...</test>
						<respStmt>
							<resp>Editor</resp>
							<name objParserValue="edit required" objParserTitle="Name"></name>
						</respStmt>
						<respStmt>
							<resp>Encoding Scheme</resp>
							<name>Jack Bowers</name>
							<name>Daniel Schopper</name>
							<name>Omar Siam</name>
						</respStmt>
						<respStmt>
							<resp>DBOE Team</resp>
							<name xml:id="" objParserTag="multibleSiblings" objParserValue="edit" objParserAttribut="variable" objParserTitle="Name"></name>
						</respStmt>
						<respStmt>
							<resp>Student assistants</resp>
							<name objParserTag="multibleSiblings" objParserValue="edit" objParserTitle="Name"></name>
						</respStmt>
					</titleStmt>
					<publicationStmt>
						<p>Publication Information</p>
					</publicationStmt>
					<sourceDesc>
						<p>Information about the source</p>
					</sourceDesc>
				</fileDesc>
			</teiHeader>
			<text>
				<body>
					<entry>
						<form type="lemma" objParserTag="multibleSiblings" objParserTagAddTitle="Ein &quot;Lemma&quot; hinzufügen">
							<orth objParserValue="edit" objParserTitle="Orth"></orth>
						</form>
						<gramGrp>
							<gram type="pos">Substantiv</gram>
							<gram type="gender">Masculinum</gram>
						</gramGrp>
						<form type="variant" subtype="diminutive" xml:id="Färzel" objParserAttribut="edit" objParserTag="multibleSiblings">
							<orth objParserValue="edit" objParserTitle="Name"></orth>
							<gramGrp>
								<gram type="gender">Neutrum</gram>
							</gramGrp>
						</form>
						<usg type="geo" objParserTag="multibleSiblings">
							<placeName type="grossregion" objParserValue="edit" objParserTitle="Ort"></placeName>
						</usg>
						<form type="variant">
							<pron xml:lang="bar-AT">fǫšts</pron>
							<usg type="geo">
								<placeName>Ahrntal</placeName>
								<placeName type="grossregion">öSTir.</placeName>
							</usg>
						</form>
						<form type="variant">
							<pron xml:lang="bar-AT">fǫrts</pron>
							<usg type="geo">
								<placeName>Lüsen</placeName>
								<placeName type="grossregion">öSTir.</placeName>
							</usg>
						</form>
						<etym>
							<cit type="etymon">
								<lang>mhd</lang>
								<form>
									<orth xml:lang="gmh">varz</orth>
								</form>
								<def>Darmwind</def>
							</cit>
							<ref type="bibl" target="#Lexer1878III">
								<citedRange>27</citedRange>
							</ref>
						</etym>
						<sense>
							<ref type="form">
								auch
								<oRef target="#Färzel"></oRef>
							</ref>
							<def>Darmwind; Furz</def>
							<usg type="geo">
								<placeName type="grossregion">STir.</placeName>
							</usg>
							<usg type="geo">
								<placeName type="grossregion">Tir.</placeName>
							</usg>
						</sense>
						<sense>
							<def>Kleinigkeit; Nichtigkeit</def>
							<usg type="geo">
								<placeName type="grossregion">öSTir.</placeName>
							</usg>
							<cit type="example">
								<quote xml:lang="bar-AT">pö̆gŋ an iǝdn fǫrts tsin dokχta špriŋ</quote>
								<usg type="geo">
									<placeName>Lüsen</placeName>
									<placeName type="grossregion">öSTir.</placeName>
								</usg>
							</cit>
						</sense>
						<sense>
							<ref type="form">
								auch
								<oRef target="#Pfarzel"></oRef>
							</ref>
							<def>kleine Pfeife aus Weidenrinde</def>
							<usg type="geo">
								<placeName type="grossregion">Industriev.</placeName>
							</usg>
						</sense>
						<re>
							<form type="lemma" subtype="compound">
								<orth>Nonnenfarzel</orth>
							</form>
							<sense>
								<def>kleines Lebkuchenstücklein</def>
								<usg type="dom">Klosterspeise</usg>
							</sense>
							<usg type="geo">
								<placeName type="grossregion">Stmk.</placeName>
							</usg>
						</re>
						<re>
							<form type="lemma" subtype="compound">
								<orth>Schneiderfarz</orth>
							</form>
							<usg type="geo">
								<placeName type="grossregion">Industriev.</placeName>
							</usg>
						</re>
						<re>
							<form type="lemma" subtype="MWE">
								<orth>der Farz ist des Bauches Arzt</orth>
							</form>
							<usg type="geo">
								<placeName type="grossregion">Ktn.</placeName>
							</usg>
							<cit type="example">
								<quote xml:lang="bar-AT">dér Fàrz ist 's pauchis àrz</quote>
								<ref type="bibl" target="#KÄRNTISCHESWB1862">
									<citedRange>90</citedRange>
								</ref>
								<usg type="geo">
									<placeName type="grossregion">Ktn.</placeName>
								</usg>
							</cit>
						</re>
						<re>
							<form type="lemma" subtype="MWE">
								<orth>Er lässt alle Farzen gehen</orth>
							</form>
							<sense>
								<def>der Organist spielt mit allen gezogenen Registern</def>
							</sense>
							<cit type="example">
								<quote xml:lang="bar-AT">Jetz låsst r af n Kchor owen widEr ålle Fårzn giehn</quote>
								<usg type="geo">
									<placeName>Matrei am Brenner</placeName>
									<placeName type="grossregion">mNTir.</placeName>
								</usg>
							</cit>
						</re>
						<re>
							<form type="lemma" subtype="MWE">
								<orth>herumschießen wie der Farz in die/der/den Reite(rn)</orth>
							</form>
							<sense>
								<def>geschäftig herumlaufen</def>
								<usg type="reg">spöttisch</usg>
							</sense>
							<usg type="geo">
								<placeName type="grossregion">Mostv.</placeName>
							</usg>
							<cit type="example">
								<quote xml:lang="bar-AT">u͂mǝdú͂m šiǝssn wiǝ dǝ pfåǝtts in dǝ raittǝ</quote>
								<usg type="geo">
									<placeName>Herzogenburg</placeName>
									<placeName type="grossregion">Mostv.</placeName>
								</usg>
							</cit>
						</re>
						<re>
							<form type="lemma" subtype="MWE">
								<orth>Man hat keinen Farz gehört</orth>
							</form>
							<sense>
								<def>es ist nichts von einer Angelegenheit bekannt geworden</def>
							</sense>
							<usg type="geo">
								<placeName type="grossregion">OTir.</placeName>
							</usg>
							<cit type="example">
								<quote xml:lang="bar-AT">Man hat kan Få'z ghęat</quote>
								<usg type="geo">
									<placeName>uIselt.</placeName>
									<placeName>Lienz.Beck.</placeName>
									<placeName type="grossregion">OTir.</placeName>
								</usg>
							</cit>
						</re>
						<re>
							<form type="lemma" subtype="MWE">
								<orth>Schwarz und Weiß / Pfarz und Scheiß</orth>
							</form>
							<sense>
								<usg type="dom">Kinderreim</usg>
							</sense>
							<usg type="geo">
								<placeName type="grossregion">Hausrv.</placeName>
							</usg>
							<cit type="example">
								<quote xml:lang="bar-AT">schwoaz und weis / Bfoaz und Scheis</quote>
								<usg type="geo">
									<placeName>Linz</placeName>
									<placeName type="grossregion">Hausrv.</placeName>
								</usg>
							</cit>
						</re>
					</entry>
				</body>
			</text>
		</TEI>
	</objPaserContent>
</objPaser>
	`
}
