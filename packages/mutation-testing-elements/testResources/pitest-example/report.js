document.querySelector('mutation-test-report-app').report = {
  schemaVersion: 1,
  thresholds: { high: 60, low: 80 },
  files: {
    'org/pitest/elements/models/PackageSummaryData.java': {
      source:
        'package org.pitest.elements.models;\n\nimport java.util.ArrayList;\nimport java.util.HashMap;\nimport java.util.List;\nimport java.util.Map;\n\npublic class PackageSummaryData implements Comparable<PackageSummaryData> {\n\n  private final String                               packageName;\n  private final Map<String, MutationTestSummaryData> fileNameToSummaryData = new HashMap<>();\n\n  public PackageSummaryData(final String packageName) {\n    this.packageName = packageName;\n  }\n\n  public void addSummaryData(final MutationTestSummaryData data) {\n    final MutationTestSummaryData existing = this.fileNameToSummaryData\n        .get(data.getFileName());\n    if (existing == null) {\n      this.fileNameToSummaryData.put(data.getFileName(), data);\n    } else {\n      existing.addTestSummary(data);\n    }\n  }\n\n  public List<MutationTestSummaryData> getSummaryData() {\n    return new ArrayList<>(this.fileNameToSummaryData.values());\n  }\n\n  @Override\n  public int compareTo(final PackageSummaryData arg0) {\n    return this.packageName.compareTo(arg0.packageName);\n  }\n}\n',
      language: 'java',
      mutants: [
        {
          id: 17,
          mutatorName: 'NegateConditionalsMutator',
          description: 'negated conditional',
          location: { start: { line: 20, column: 1 }, end: { line: 20, column: 27 } },
          status: 'Killed'
        },
        {
          id: 18,
          mutatorName: 'VoidMethodCallMutator',
          description: 'removed call to org/pitest/elements/models/MutationTestSummaryData::addTestSummary',
          location: { start: { line: 23, column: 1 }, end: { line: 23, column: 36 } },
          status: 'Survived'
        },
        {
          id: 19,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/models/PackageSummaryData::getSummaryData to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 28, column: 1 }, end: { line: 28, column: 64 } },
          status: 'Killed'
        },
        {
          id: 20,
          mutatorName: 'ReturnValsMutator',
          description: 'replaced return of integer sized value with (x == 0 ? 1 : 0)',
          location: { start: { line: 33, column: 1 }, end: { line: 33, column: 56 } },
          status: 'Killed'
        }
      ]
    },
    'org/pitest/elements/MutationTestingElementsReportFactory.java': {
      source:
        '/*\n * Copyright 2010 Henry Coles\n *\n * Licensed under the Apache License, Version 2.0 (the "License");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n * http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing,\n * software distributed under the License is distributed on an "AS IS" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and limitations under the License.\n */\n\npackage org.pitest.elements;\n\nimport org.pitest.mutationtest.ListenerArguments;\nimport org.pitest.mutationtest.MutationResultListener;\nimport org.pitest.mutationtest.MutationResultListenerFactory;\n\nimport java.util.Properties;\n\npublic class MutationTestingElementsReportFactory implements MutationResultListenerFactory {\n\n  @Override\n  public MutationResultListener getListener(Properties props,\n      ListenerArguments args) {\n    return new MutationReportListener(args.getCoverage(),\n        args.getOutputStrategy(), args.getLocator());\n  }\n\n  @Override\n  public String name() {\n    return "HTML2";\n  }\n\n  @Override\n  public String description() {\n    return "Mutation testing elements html report plugin";\n  }\n}\n',
      language: 'java',
      mutants: [
        {
          id: 0,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/MutationTestingElementsReportFactory::getListener to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 29, column: 1 }, end: { line: 29, column: 57 } },
          status: 'NoCoverage'
        },
        {
          id: 1,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/MutationTestingElementsReportFactory::name to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 35, column: 1 }, end: { line: 35, column: 19 } },
          status: 'NoCoverage'
        },
        {
          id: 2,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/MutationTestingElementsReportFactory::description to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 40, column: 1 }, end: { line: 40, column: 58 } },
          status: 'NoCoverage'
        }
      ]
    },
    'org/pitest/elements/utils/InputStreamLineIterable.java': {
      source:
        'package org.pitest.elements.utils;\n\nimport java.io.BufferedReader;\nimport java.io.IOException;\nimport java.io.Reader;\nimport java.util.Iterator;\n\npublic class InputStreamLineIterable implements Iterable<String> {\n\n  private final BufferedReader reader;\n  private       String         next;\n\n  public InputStreamLineIterable(final Reader reader) {\n    this.reader = new BufferedReader(reader);\n    advance();\n  }\n\n  private void advance() {\n    try {\n      this.next = this.reader.readLine();\n    } catch (final IOException e) {\n      this.next = null;\n    }\n  }\n\n  public String next() {\n    final String t = this.next;\n    advance();\n    return t;\n  }\n\n  @Override\n  public Iterator<String> iterator() {\n    return new Iterator<String>() {\n\n      @Override\n      public boolean hasNext() {\n        return InputStreamLineIterable.this.next != null;\n      }\n\n      @Override\n      public String next() {\n        return InputStreamLineIterable.this.next();\n      }\n\n      @Override\n      public void remove() {\n        throw new UnsupportedOperationException();\n      }\n\n    };\n  }\n\n}\n',
      language: 'java',
      mutants: [
        {
          id: 56,
          mutatorName: 'VoidMethodCallMutator',
          description: 'removed call to org/pitest/elements/utils/InputStreamLineIterable::advance',
          location: { start: { line: 15, column: 1 }, end: { line: 15, column: 14 } },
          status: 'Killed'
        },
        {
          id: 57,
          mutatorName: 'VoidMethodCallMutator',
          description: 'removed call to org/pitest/elements/utils/InputStreamLineIterable::advance',
          location: { start: { line: 28, column: 1 }, end: { line: 28, column: 14 } },
          status: 'RuntimeError'
        },
        {
          id: 58,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/utils/InputStreamLineIterable::next to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 29, column: 1 }, end: { line: 29, column: 13 } },
          status: 'Killed'
        },
        {
          id: 59,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/utils/InputStreamLineIterable::iterator to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 34, column: 1 }, end: { line: 34, column: 35 } },
          status: 'Killed'
        },
        {
          id: 60,
          mutatorName: 'NegateConditionalsMutator',
          description: 'negated conditional',
          location: { start: { line: 38, column: 1 }, end: { line: 38, column: 57 } },
          status: 'Killed'
        },
        {
          id: 61,
          mutatorName: 'ReturnValsMutator',
          description: 'replaced return of integer sized value with (x == 0 ? 1 : 0)',
          location: { start: { line: 38, column: 1 }, end: { line: 38, column: 57 } },
          status: 'Killed'
        },
        {
          id: 62,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/utils/InputStreamLineIterable$1::next to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 43, column: 1 }, end: { line: 43, column: 51 } },
          status: 'Killed'
        }
      ]
    },
    'org/pitest/elements/utils/MutationIdCounter.java': {
      source:
        'package org.pitest.elements.utils;\n\npublic class MutationIdCounter {\n  private int counter = 0;\n\n  public int next(){\n    return counter++;\n  }\n  public void reset(){\n    this.counter = 0;\n  }\n}\n',
      language: 'java',
      mutants: [
        {
          id: 63,
          mutatorName: 'MathMutator',
          description: 'Replaced integer addition with subtraction',
          location: { start: { line: 7, column: 1 }, end: { line: 7, column: 21 } },
          status: 'Killed'
        },
        {
          id: 64,
          mutatorName: 'ReturnValsMutator',
          description: 'replaced return of integer sized value with (x == 0 ? 1 : 0)',
          location: { start: { line: 7, column: 1 }, end: { line: 7, column: 21 } },
          status: 'Killed'
        }
      ]
    },
    'org/pitest/elements/models/json/JsonFile.java': {
      source:
        'package org.pitest.elements.models.json;\n\nimport java.util.ArrayList;\nimport java.util.Collection;\nimport java.util.List;\n\npublic class JsonFile {\n  private String           source   = "";\n  private String           language = "java";\n  private List<JsonMutant> mutants  = new ArrayList<>();\n\n  public void addMutants(final Collection<JsonMutant> mutants) {\n    mutants.forEach(this::addMutant);\n  }\n\n  public void addMutant(final JsonMutant mutant) {\n    this.mutants.add(mutant);\n  }\n\n  public void addSource(String source) {\n    if (this.source.isEmpty()) {\n      this.source = source;\n    }\n  }\n}\n',
      language: 'java',
      mutants: [
        {
          id: 37,
          mutatorName: 'VoidMethodCallMutator',
          description: 'removed call to java/util/Collection::forEach',
          location: { start: { line: 13, column: 1 }, end: { line: 13, column: 37 } },
          status: 'Killed'
        },
        {
          id: 38,
          mutatorName: 'NegateConditionalsMutator',
          description: 'negated conditional',
          location: { start: { line: 21, column: 1 }, end: { line: 21, column: 32 } },
          status: 'Killed'
        }
      ]
    },
    'org/pitest/elements/utils/JsonParser.java': {
      source:
        'package org.pitest.elements.utils;\n\nimport com.google.gson.Gson;\nimport com.google.gson.GsonBuilder;\nimport org.pitest.classinfo.ClassInfo;\nimport org.pitest.functional.FCollection;\nimport org.pitest.mutationtest.MutationResult;\nimport org.pitest.mutationtest.SourceLocator;\nimport org.pitest.elements.models.Line;\nimport org.pitest.elements.models.MutationTestSummaryData;\nimport org.pitest.elements.models.PackageSummaryData;\nimport org.pitest.elements.models.PackageSummaryMap;\nimport org.pitest.elements.models.json.*;\n\nimport java.io.IOException;\nimport java.io.Reader;\nimport java.util.*;\n\npublic class JsonParser {\n  private final Collection<SourceLocator> sourceRoots;\n\n  public JsonParser(final Collection<SourceLocator> sourceRoots) {\n    this.sourceRoots = sourceRoots;\n  }\n\n  private final Gson              gson              = new GsonBuilder()\n      .disableHtmlEscaping().create();\n  private final MutationIdCounter mutationIdCounter = new MutationIdCounter();\n\n  public String toJson(final PackageSummaryMap packageSummaryMap)\n      throws IOException {\n    mutationIdCounter.reset();\n    final Map<String, JsonFile> collectedJsonFiles = new HashMap<>();\n\n    List<PackageSummaryData> sortedPackageData = packageSummaryMap.valuesList();\n    Collections.sort(sortedPackageData);\n\n    for (PackageSummaryData packageData : sortedPackageData) {\n      for (MutationTestSummaryData testData : packageData.getSummaryData()) {\n        this.addToJsonFiles(collectedJsonFiles, testData);\n      }\n    }\n    final JsonReport report = new JsonReport(collectedJsonFiles);\n    return gson.toJson(report, JsonReport.class);\n  }\n\n  private void addToJsonFiles(\n      final Map<String, JsonFile> collectedJsonFiles,\n      final MutationTestSummaryData data) throws IOException {\n    // Step 1: Map mutations to lines\n    final List<Line> lines = this.getLines(data);\n\n    // Step 2: Create or retrieve JsonFile\n    final String fullPath = data.getPackageName() + "/" + data.getFileName();\n    if (collectedJsonFiles.get(fullPath) == null) {\n      collectedJsonFiles.put(fullPath, new JsonFile());\n    }\n    final JsonFile file = collectedJsonFiles.get(fullPath);\n\n    // Step 3: Add source and mutants to file\n    file.addSource(this.getSourceFromLines(lines));\n    file.addMutants(this.getMutantsFromLines(lines, data));\n  }\n\n  private List<JsonMutant> getMutantsFromLines(final List<Line> lines,\n      final MutationTestSummaryData data) {\n    final List<JsonMutant> jsonMutants = new ArrayList<>();\n    if (lines.isEmpty()) {\n      // If there are no lines, add the mutants anyway, without source\n      for (MutationResult mutationResult : data.getResults()) {\n        jsonMutants.add(this.mapToJsonMutant(mutationResult, JsonLocation.empty()));\n      }\n    } else {\n      for (final Line line : lines) {\n        for (MutationResult mutationResult : line.getMutations()) {\n          jsonMutants.add(this.mapToJsonMutant(mutationResult, JsonLocation\n              .ofLine(line)));\n        }\n      }\n    }\n    return jsonMutants;\n  }\n\n  private String getSourceFromLines(final List<Line> lines) {\n    if (lines.isEmpty()) {\n      return "   ";\n    }\n    StringBuilder builder = new StringBuilder();\n    for (final Line line : lines) {\n      builder.append(line.getText());\n      builder.append("\\n");\n    }\n    return builder.toString();\n  }\n\n  private List<Line> getLines(final MutationTestSummaryData summaryData)\n      throws IOException {\n    final String fileName = summaryData.getFileName();\n    final Collection<ClassInfo> classes = summaryData.getClasses();\n    final Optional<Reader> reader = findReaderForSource(classes, fileName);\n    if (reader.isPresent()) {\n      final LineFactory lineFactory = new LineFactory(summaryData.getResults());\n      return lineFactory.convert(reader.get());\n    }\n    return Collections.emptyList();\n  }\n\n  private Optional<Reader> findReaderForSource(\n      final Collection<ClassInfo> classes, final String fileName) {\n    for (final SourceLocator each : this.sourceRoots) {\n      final Optional<Reader> maybe = each\n          .locate(this.classInfoToNames(classes), fileName);\n      if (maybe.isPresent())\n        return maybe;\n    }\n    return Optional.empty();\n  }\n\n  private Collection<String> classInfoToNames(\n      final Collection<ClassInfo> classes) {\n    return FCollection.map(classes, a -> a.getName().asJavaName());\n  }\n\n  private JsonMutant mapToJsonMutant(final MutationResult mutation,\n      final JsonLocation location) {\n    final String fullMutatorName = mutation.getDetails().getMutator();\n    // Only show the class name\n    final String mutatorName = fullMutatorName\n        .substring(fullMutatorName.lastIndexOf(".") + 1);\n\n    final JsonMutantStatus status = JsonMutantStatus\n        .fromPitestStatus(mutation.getStatus());\n    return new JsonMutant(mutationIdCounter.next(), mutatorName,\n        mutation.getDetails().getDescription(), location, status);\n  }\n}\n',
      language: 'java',
      mutants: [
        {
          id: 65,
          mutatorName: 'VoidMethodCallMutator',
          description: 'removed call to org/pitest/elements/utils/MutationIdCounter::reset',
          location: { start: { line: 32, column: 1 }, end: { line: 32, column: 30 } },
          status: 'Survived'
        },
        {
          id: 66,
          mutatorName: 'VoidMethodCallMutator',
          description: 'removed call to java/util/Collections::sort',
          location: { start: { line: 36, column: 1 }, end: { line: 36, column: 40 } },
          status: 'Survived'
        },
        {
          id: 67,
          mutatorName: 'VoidMethodCallMutator',
          description: 'removed call to org/pitest/elements/utils/JsonParser::addToJsonFiles',
          location: { start: { line: 40, column: 1 }, end: { line: 40, column: 58 } },
          status: 'Killed'
        },
        {
          id: 68,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/utils/JsonParser::toJson to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 44, column: 1 }, end: { line: 44, column: 49 } },
          status: 'Killed'
        },
        {
          id: 69,
          mutatorName: 'NegateConditionalsMutator',
          description: 'negated conditional',
          location: { start: { line: 55, column: 1 }, end: { line: 55, column: 51 } },
          status: 'Killed'
        },
        {
          id: 70,
          mutatorName: 'VoidMethodCallMutator',
          description: 'removed call to org/pitest/elements/models/json/JsonFile::addSource',
          location: { start: { line: 61, column: 1 }, end: { line: 61, column: 51 } },
          status: 'Killed'
        },
        {
          id: 71,
          mutatorName: 'VoidMethodCallMutator',
          description: 'removed call to org/pitest/elements/models/json/JsonFile::addMutants',
          location: { start: { line: 62, column: 1 }, end: { line: 62, column: 59 } },
          status: 'Killed'
        },
        {
          id: 72,
          mutatorName: 'NegateConditionalsMutator',
          description: 'negated conditional',
          location: { start: { line: 68, column: 1 }, end: { line: 68, column: 26 } },
          status: 'Killed'
        },
        {
          id: 73,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/utils/JsonParser::getMutantsFromLines to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 81, column: 1 }, end: { line: 81, column: 23 } },
          status: 'Killed'
        },
        {
          id: 74,
          mutatorName: 'NegateConditionalsMutator',
          description: 'negated conditional',
          location: { start: { line: 85, column: 1 }, end: { line: 85, column: 26 } },
          status: 'Killed'
        },
        {
          id: 75,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/utils/JsonParser::getSourceFromLines to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 86, column: 1 }, end: { line: 86, column: 19 } },
          status: 'NoCoverage'
        },
        {
          id: 76,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/utils/JsonParser::getSourceFromLines to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 93, column: 1 }, end: { line: 93, column: 30 } },
          status: 'Killed'
        },
        {
          id: 77,
          mutatorName: 'NegateConditionalsMutator',
          description: 'negated conditional',
          location: { start: { line: 101, column: 1 }, end: { line: 101, column: 29 } },
          status: 'Killed'
        },
        {
          id: 78,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/utils/JsonParser::getLines to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 103, column: 1 }, end: { line: 103, column: 47 } },
          status: 'Killed'
        },
        {
          id: 79,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/utils/JsonParser::getLines to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 105, column: 1 }, end: { line: 105, column: 35 } },
          status: 'NoCoverage'
        },
        {
          id: 80,
          mutatorName: 'NegateConditionalsMutator',
          description: 'negated conditional',
          location: { start: { line: 113, column: 1 }, end: { line: 113, column: 28 } },
          status: 'Killed'
        },
        {
          id: 81,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/utils/JsonParser::findReaderForSource to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 114, column: 1 }, end: { line: 114, column: 21 } },
          status: 'Killed'
        },
        {
          id: 82,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/utils/JsonParser::findReaderForSource to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 116, column: 1 }, end: { line: 116, column: 28 } },
          status: 'NoCoverage'
        },
        {
          id: 83,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/utils/JsonParser::classInfoToNames to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 121, column: 1 }, end: { line: 121, column: 67 } },
          status: 'Survived'
        },
        {
          id: 84,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/utils/JsonParser::lambda$classInfoToNames$0 to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 121, column: 1 }, end: { line: 121, column: 67 } },
          status: 'Survived'
        },
        {
          id: 85,
          mutatorName: 'MathMutator',
          description: 'Replaced integer addition with subtraction',
          location: { start: { line: 129, column: 1 }, end: { line: 129, column: 57 } },
          status: 'Killed'
        },
        {
          id: 86,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/utils/JsonParser::mapToJsonMutant to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 133, column: 1 }, end: { line: 133, column: 64 } },
          status: 'Killed'
        }
      ]
    },
    'org/pitest/elements/models/json/JsonMutantStatus.java': {
      source:
        "package org.pitest.elements.models.json;\n\nimport org.pitest.mutationtest.*;\n\npublic enum JsonMutantStatus {\n  Killed, Survived, NoCoverage, CompileError, RuntimeError, Timeout;\n\n  public static JsonMutantStatus fromPitestStatus(\n      DetectionStatus status) {\n    switch (status) {\n    case KILLED:\n      return JsonMutantStatus.Killed;\n    case MEMORY_ERROR:\n      return JsonMutantStatus.RuntimeError;\n    case NO_COVERAGE:\n      return JsonMutantStatus.NoCoverage;\n    case RUN_ERROR:\n      return JsonMutantStatus.RuntimeError;\n    case SURVIVED:\n      return JsonMutantStatus.Survived;\n    case TIMED_OUT:\n      return JsonMutantStatus.Timeout;\n    // If there's an internal state at the end, something probably went wrong\n    case NON_VIABLE:\n    case STARTED:\n    case NOT_STARTED:\n    default:\n      return JsonMutantStatus.RuntimeError;\n    }\n  }\n}\n\n\n",
      language: 'java',
      mutants: [
        {
          id: 39,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/models/json/JsonMutantStatus::fromPitestStatus to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 12, column: 1 }, end: { line: 12, column: 37 } },
          status: 'NoCoverage'
        },
        {
          id: 40,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/models/json/JsonMutantStatus::fromPitestStatus to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 14, column: 1 }, end: { line: 14, column: 43 } },
          status: 'NoCoverage'
        },
        {
          id: 41,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/models/json/JsonMutantStatus::fromPitestStatus to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 16, column: 1 }, end: { line: 16, column: 41 } },
          status: 'Killed'
        },
        {
          id: 42,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/models/json/JsonMutantStatus::fromPitestStatus to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 18, column: 1 }, end: { line: 18, column: 43 } },
          status: 'NoCoverage'
        },
        {
          id: 43,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/models/json/JsonMutantStatus::fromPitestStatus to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 20, column: 1 }, end: { line: 20, column: 39 } },
          status: 'NoCoverage'
        },
        {
          id: 44,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/models/json/JsonMutantStatus::fromPitestStatus to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 22, column: 1 }, end: { line: 22, column: 38 } },
          status: 'NoCoverage'
        },
        {
          id: 45,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/models/json/JsonMutantStatus::fromPitestStatus to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 28, column: 1 }, end: { line: 28, column: 43 } },
          status: 'NoCoverage'
        }
      ]
    },
    'org/pitest/elements/models/PackageSummaryMap.java': {
      source:
        'package org.pitest.elements.models;\n\nimport java.util.*;\n\npublic class PackageSummaryMap {\n\n  private final Map<String, PackageSummaryData> packageSummaryData = new TreeMap<>();\n\n  private PackageSummaryData getPackageSummaryData(final String packageName) {\n    if (this.packageSummaryData.containsKey(packageName)) {\n      return this.packageSummaryData.get(packageName);\n    } else {\n      final PackageSummaryData psData = new PackageSummaryData(packageName);\n      this.packageSummaryData.put(packageName, psData);\n      return psData;\n    }\n  }\n\n  public void update(final String packageName,\n      final MutationTestSummaryData data) {\n    final PackageSummaryData psd = getPackageSummaryData(packageName);\n    psd.addSummaryData(data);\n  }\n\n  public List<PackageSummaryData> valuesList() {\n    return new ArrayList<>(this.packageSummaryData.values());\n  }\n}\n',
      language: 'java',
      mutants: [
        {
          id: 30,
          mutatorName: 'NegateConditionalsMutator',
          description: 'negated conditional',
          location: { start: { line: 10, column: 1 }, end: { line: 10, column: 59 } },
          status: 'Killed'
        },
        {
          id: 31,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/models/PackageSummaryMap::getPackageSummaryData to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 11, column: 1 }, end: { line: 11, column: 54 } },
          status: 'NoCoverage'
        },
        {
          id: 32,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/models/PackageSummaryMap::getPackageSummaryData to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 15, column: 1 }, end: { line: 15, column: 20 } },
          status: 'Killed'
        },
        {
          id: 33,
          mutatorName: 'VoidMethodCallMutator',
          description: 'removed call to org/pitest/elements/models/PackageSummaryData::addSummaryData',
          location: { start: { line: 22, column: 1 }, end: { line: 22, column: 29 } },
          status: 'Killed'
        },
        {
          id: 34,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/models/PackageSummaryMap::valuesList to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 26, column: 1 }, end: { line: 26, column: 61 } },
          status: 'Killed'
        }
      ]
    },
    'org/pitest/elements/models/Line.java': {
      source:
        '/*\n * Copyright 2010 Henry Coles\n *\n * Licensed under the Apache License, Version 2.0 (the "License");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n * http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing,\n * software distributed under the License is distributed on an "AS IS" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and limitations under the License.\n */\npackage org.pitest.elements.models;\n\nimport org.pitest.mutationtest.MutationResult;\n\nimport java.util.List;\n\npublic class Line {\n  private final long                 number;\n  private final String               text;\n  private final List<MutationResult> mutations;\n\n  public Line(final long number, final String text, final List<MutationResult> mutations) {\n    this.number = number;\n    this.text = text;\n    this.mutations = mutations;\n  }\n\n  public long getNumber() {\n    return this.number;\n  }\n\n  public String getText() {\n    return this.text;\n  }\n\n  public List<MutationResult> getMutations() {\n    return this.mutations;\n  }\n\n}\n',
      language: 'java',
      mutants: [
        {
          id: 21,
          mutatorName: 'ReturnValsMutator',
          description: 'replaced return of long value with value + 1 for org/pitest/elements/models/Line::getNumber',
          location: { start: { line: 33, column: 1 }, end: { line: 33, column: 23 } },
          status: 'Killed'
        },
        {
          id: 22,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/models/Line::getText to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 37, column: 1 }, end: { line: 37, column: 21 } },
          status: 'Killed'
        },
        {
          id: 23,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/models/Line::getMutations to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 41, column: 1 }, end: { line: 41, column: 26 } },
          status: 'Killed'
        }
      ]
    },
    'org/pitest/elements/utils/MutationTestSummaryDataFileNameComparator.java': {
      source:
        'package org.pitest.elements.utils;\n\nimport org.pitest.elements.models.MutationTestSummaryData;\n\nimport java.io.Serializable;\nimport java.util.Comparator;\n\npublic class MutationTestSummaryDataFileNameComparator implements\n  Comparator<MutationTestSummaryData>, Serializable {\n\n  private static final long serialVersionUID = 1L;\n\n  @Override\n  public int compare(final MutationTestSummaryData arg0,\n      final MutationTestSummaryData arg1) {\n    return arg0.getFileName().compareTo(arg1.getFileName());\n  }\n\n}\n',
      language: 'java',
      mutants: [
        {
          id: 46,
          mutatorName: 'ReturnValsMutator',
          description: 'replaced return of integer sized value with (x == 0 ? 1 : 0)',
          location: { start: { line: 16, column: 1 }, end: { line: 16, column: 60 } },
          status: 'Killed'
        }
      ]
    },
    'org/pitest/elements/MutationReportListener.java': {
      source:
        'package org.pitest.elements;\n\nimport org.pitest.coverage.CoverageDatabase;\nimport org.pitest.mutationtest.ClassMutationResults;\nimport org.pitest.mutationtest.MutationResultListener;\nimport org.pitest.mutationtest.SourceLocator;\nimport org.pitest.elements.models.MutationTestSummaryData;\nimport org.pitest.elements.models.PackageSummaryMap;\nimport org.pitest.elements.utils.JsonParser;\nimport org.pitest.util.FileUtil;\nimport org.pitest.util.Log;\nimport org.pitest.util.ResultOutputStrategy;\n\nimport java.io.File;\nimport java.io.IOException;\nimport java.io.InputStream;\nimport java.io.Writer;\nimport java.util.Arrays;\nimport java.util.Collections;\nimport java.util.HashSet;\nimport java.util.logging.Level;\n\npublic class MutationReportListener implements MutationResultListener {\n\n  private final ResultOutputStrategy outputStrategy;\n\n  private final JsonParser jsonParser;\n\n  private final CoverageDatabase  coverage;\n  private final PackageSummaryMap packageSummaryData = new PackageSummaryMap();\n\n  public MutationReportListener(final CoverageDatabase coverage,\n      final ResultOutputStrategy outputStrategy, final SourceLocator... locators) {\n    this.coverage = coverage;\n    this.outputStrategy = outputStrategy;\n    this.jsonParser = new JsonParser(\n        new HashSet<>(Arrays.asList(locators)));\n  }\n\n  private String loadHtml() {\n    final String startHtml = "<!DOCTYPE html>\\n" + "<html>\\n" + "<body>\\n"\n        + "  <mutation-test-report-app title-postfix=\\"Pit Test Coverage Report\\">\\n"\n        + "    Your browser doesn\'t support <a href=\\"https://caniuse.com/#search=custom%20elements\\">custom elements</a>.\\n"\n        + "    Please use a latest version of an evergreen browser (Firefox, Chrome, Safari, Opera, etc).\\n"\n        + "  </mutation-test-report-app>\\n"\n        + "  <script src=\\"report.js\\"></script>\\n" + "  <script>";\n    final String endHtml = "  </script>\\n" + "</body>\\n" + "</html>";\n    try {\n      final String htmlReportResource = "mutation-testing-elements/mutation-test-elements.js";\n      final InputStream inputStream = this.getClass().getClassLoader().getResourceAsStream(htmlReportResource);\n      return startHtml + FileUtil.readToString(inputStream) + endHtml;\n    } catch (final IOException e) {\n      Log.getLogger().log(Level.SEVERE, "Error while loading css", e);\n    }\n    return "";\n  }\n\n  private void createHtml() {\n    final String content = this.loadHtml();\n    final Writer writer = this.outputStrategy\n        .createWriterForFile("html2" + File.separatorChar + "index.html");\n    try {\n      writer.write(content);\n      writer.close();\n    } catch (final IOException e) {\n      e.printStackTrace();\n    }\n  }\n\n  private void createJs(final String json) {\n    final String content =\n        "document.querySelector(\'mutation-test-report-app\').report = " + json;\n    final Writer writer = this.outputStrategy\n        .createWriterForFile("html2" + File.separatorChar + "report.js");\n    try {\n      writer.write(content);\n      writer.close();\n    } catch (final IOException e) {\n      e.printStackTrace();\n    }\n  }\n\n  private MutationTestSummaryData createSummaryData(\n      final CoverageDatabase coverage, final ClassMutationResults data) {\n    return new MutationTestSummaryData(data.getFileName(),\n        data.getMutations(), coverage.getClassInfo(Collections.singleton(data.getMutatedClass())));\n  }\n\n  private void updatePackageSummary(\n      final ClassMutationResults mutationMetaData) {\n    final String packageName = mutationMetaData.getPackageName();\n\n    this.packageSummaryData.update(packageName,\n        createSummaryData(this.coverage, mutationMetaData));\n  }\n\n  @Override\n  public void runStart() {\n    // Nothing to do\n  }\n\n  @Override\n  public void handleMutationResult(ClassMutationResults metaData) {\n    updatePackageSummary(metaData);\n  }\n\n  @Override\n  public void runEnd() {\n    try {\n      String json = jsonParser.toJson(this.packageSummaryData);\n      createHtml();\n      createJs(json);\n    } catch (IOException e) {\n      e.printStackTrace();\n    }\n  }\n}\n',
      language: 'java',
      mutants: [
        {
          id: 3,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/MutationReportListener::loadHtml to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 51, column: 1 }, end: { line: 51, column: 70 } },
          status: 'Survived'
        },
        {
          id: 4,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/MutationReportListener::loadHtml to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 55, column: 1 }, end: { line: 55, column: 14 } },
          status: 'NoCoverage'
        },
        {
          id: 5,
          mutatorName: 'VoidMethodCallMutator',
          description: 'removed call to java/io/Writer::write',
          location: { start: { line: 63, column: 1 }, end: { line: 63, column: 28 } },
          status: 'Survived'
        },
        {
          id: 6,
          mutatorName: 'VoidMethodCallMutator',
          description: 'removed call to java/io/Writer::close',
          location: { start: { line: 64, column: 1 }, end: { line: 64, column: 21 } },
          status: 'Survived'
        },
        {
          id: 7,
          mutatorName: 'VoidMethodCallMutator',
          description: 'removed call to java/io/IOException::printStackTrace',
          location: { start: { line: 66, column: 1 }, end: { line: 66, column: 26 } },
          status: 'NoCoverage'
        },
        {
          id: 8,
          mutatorName: 'VoidMethodCallMutator',
          description: 'removed call to java/io/Writer::write',
          location: { start: { line: 76, column: 1 }, end: { line: 76, column: 28 } },
          status: 'Survived'
        },
        {
          id: 9,
          mutatorName: 'VoidMethodCallMutator',
          description: 'removed call to java/io/Writer::close',
          location: { start: { line: 77, column: 1 }, end: { line: 77, column: 21 } },
          status: 'Survived'
        },
        {
          id: 10,
          mutatorName: 'VoidMethodCallMutator',
          description: 'removed call to java/io/IOException::printStackTrace',
          location: { start: { line: 79, column: 1 }, end: { line: 79, column: 26 } },
          status: 'NoCoverage'
        },
        {
          id: 11,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/MutationReportListener::createSummaryData to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 85, column: 1 }, end: { line: 85, column: 58 } },
          status: 'NoCoverage'
        },
        {
          id: 12,
          mutatorName: 'VoidMethodCallMutator',
          description: 'removed call to org/pitest/elements/models/PackageSummaryMap::update',
          location: { start: { line: 93, column: 1 }, end: { line: 93, column: 47 } },
          status: 'NoCoverage'
        },
        {
          id: 13,
          mutatorName: 'VoidMethodCallMutator',
          description: 'removed call to org/pitest/elements/MutationReportListener::updatePackageSummary',
          location: { start: { line: 104, column: 1 }, end: { line: 104, column: 35 } },
          status: 'NoCoverage'
        },
        {
          id: 14,
          mutatorName: 'VoidMethodCallMutator',
          description: 'removed call to org/pitest/elements/MutationReportListener::createHtml',
          location: { start: { line: 111, column: 1 }, end: { line: 111, column: 19 } },
          status: 'Killed'
        },
        {
          id: 15,
          mutatorName: 'VoidMethodCallMutator',
          description: 'removed call to org/pitest/elements/MutationReportListener::createJs',
          location: { start: { line: 112, column: 1 }, end: { line: 112, column: 21 } },
          status: 'Killed'
        },
        {
          id: 16,
          mutatorName: 'VoidMethodCallMutator',
          description: 'removed call to java/io/IOException::printStackTrace',
          location: { start: { line: 114, column: 1 }, end: { line: 114, column: 26 } },
          status: 'NoCoverage'
        }
      ]
    },
    'org/pitest/elements/models/MutationTestSummaryData.java': {
      source:
        '/*\n * Copyright 2010 Henry Coles\n *\n * Licensed under the Apache License, Version 2.0 (the "License");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n * http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing,\n * software distributed under the License is distributed on an "AS IS" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and limitations under the License.\n */\npackage org.pitest.elements.models;\n\nimport org.pitest.classinfo.ClassInfo;\nimport org.pitest.mutationtest.MutationResult;\n\nimport java.util.ArrayList;\nimport java.util.Collection;\nimport java.util.HashSet;\nimport java.util.Set;\n\npublic class MutationTestSummaryData {\n\n  private final String                     fileName;\n  private final Collection<MutationResult> mutations = new ArrayList<>();\n  private final Set<ClassInfo>             classes   = new HashSet<>();\n\n  public MutationTestSummaryData(final String fileName,\n      final Collection<MutationResult> results, final Collection<ClassInfo> classes) {\n    this.fileName = fileName;\n    this.mutations.addAll(results);\n    this.classes.addAll(classes);\n  }\n\n  public String getPackageName() {\n    // Name needs to be in slashes instead of dots for mutation-testing-elements\n    final String packageName = this.classes.iterator().next().getName()\n        .asJavaName().replace(".", "/");\n    final int lastSlash = packageName.lastIndexOf(\'/\');\n    return lastSlash > 0 ? packageName.substring(0, lastSlash) : "default";\n  }\n\n  public void addTestSummary(final MutationTestSummaryData data) {\n    this.mutations.addAll(data.mutations);\n    this.classes.addAll(data.classes);\n  }\n\n  public String getFileName() {\n    return this.fileName;\n  }\n\n  public Collection<MutationResult> getResults() {\n    return this.mutations;\n  }\n\n  public Collection<ClassInfo> getClasses() {\n    return this.classes;\n  }\n\n}\n',
      language: 'java',
      mutants: [
        {
          id: 24,
          mutatorName: 'ConditionalsBoundaryMutator',
          description: 'changed conditional boundary',
          location: { start: { line: 43, column: 1 }, end: { line: 43, column: 75 } },
          status: 'Survived'
        },
        {
          id: 25,
          mutatorName: 'NegateConditionalsMutator',
          description: 'negated conditional',
          location: { start: { line: 43, column: 1 }, end: { line: 43, column: 75 } },
          status: 'Killed'
        },
        {
          id: 26,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/models/MutationTestSummaryData::getPackageName to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 43, column: 1 }, end: { line: 43, column: 75 } },
          status: 'Killed'
        },
        {
          id: 27,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/models/MutationTestSummaryData::getFileName to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 52, column: 1 }, end: { line: 52, column: 25 } },
          status: 'Killed'
        },
        {
          id: 28,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/models/MutationTestSummaryData::getResults to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 56, column: 1 }, end: { line: 56, column: 26 } },
          status: 'Killed'
        },
        {
          id: 29,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/models/MutationTestSummaryData::getClasses to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 60, column: 1 }, end: { line: 60, column: 24 } },
          status: 'Killed'
        }
      ]
    },
    'org/pitest/elements/models/json/JsonLocation.java': {
      source:
        'package org.pitest.elements.models.json;\n\nimport org.pitest.elements.models.Line;\n\npublic class JsonLocation {\n  private LineAndColumn start, end;\n\n  public JsonLocation(final LineAndColumn start, final LineAndColumn end) {\n    this.start = start;\n    this.end = end;\n  }\n\n  public static JsonLocation ofLine(Line line) {\n    final LineAndColumn start = new LineAndColumn((int) line.getNumber(), 1);\n    final LineAndColumn end = new LineAndColumn((int) line.getNumber(),\n        line.getText().length());\n    return new JsonLocation(start, end);\n  }\n\n  public static JsonLocation empty(){\n    return new JsonLocation(new LineAndColumn(1, 1), new LineAndColumn(1, 2));\n  }\n}\n\nclass LineAndColumn {\n  int line;\n  int column;\n\n  public LineAndColumn(final int line, final int column) {\n    this.line = line;\n    this.column = column;\n  }\n}\n',
      language: 'java',
      mutants: [
        {
          id: 35,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/models/json/JsonLocation::ofLine to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 17, column: 1 }, end: { line: 17, column: 40 } },
          status: 'Killed'
        },
        {
          id: 36,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/models/json/JsonLocation::empty to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 21, column: 1 }, end: { line: 21, column: 78 } },
          status: 'NoCoverage'
        }
      ]
    },
    'org/pitest/elements/utils/LineFactory.java': {
      source:
        '/*\n * Copyright 2010 Henry Coles\n *\n * Licensed under the Apache License, Version 2.0 (the "License");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n * http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing,\n * software distributed under the License is distributed on an "AS IS" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and limitations under the License.\n */\npackage org.pitest.elements.utils;\n\nimport org.pitest.functional.FCollection;\nimport org.pitest.mutationtest.MutationResult;\nimport org.pitest.elements.models.Line;\n\nimport java.io.IOException;\nimport java.io.Reader;\nimport java.util.Collection;\nimport java.util.List;\nimport java.util.function.Function;\nimport java.util.function.Predicate;\nimport java.util.stream.Collectors;\n\npublic class LineFactory {\n\n  private final Collection<MutationResult> mutations;\n\n  public LineFactory(final Collection<MutationResult> mutations) {\n    this.mutations = mutations;\n  }\n\n  public List<Line> convert(final Reader source) throws IOException {\n    try {\n      final InputStreamLineIterable lines = new InputStreamLineIterable(source);\n      return FCollection.map(lines, stringToAnnotatedLine());\n    } finally {\n      source.close();\n    }\n  }\n\n  private Function<String, Line> stringToAnnotatedLine() {\n    return new Function<String, Line>() {\n      private int lineNumber = 1;\n\n      @Override\n      public Line apply(final String a) {\n        final Line l = new Line(this.lineNumber, a,\n            getMutationsForLine(this.lineNumber));\n        this.lineNumber++;\n        return l;\n      }\n    };\n  }\n\n  private List<MutationResult> getMutationsForLine(final int lineNumber) {\n    return this.mutations.stream().filter(isAtLineNumber(lineNumber))\n        .collect(Collectors.toList());\n  }\n\n  private Predicate<MutationResult> isAtLineNumber(final int lineNumber) {\n    return result -> result.getDetails().getLineNumber() == lineNumber;\n  }\n\n}\n',
      language: 'java',
      mutants: [
        {
          id: 47,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/utils/LineFactory::convert to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 40, column: 1 }, end: { line: 40, column: 61 } },
          status: 'Killed'
        },
        {
          id: 48,
          mutatorName: 'VoidMethodCallMutator',
          description: 'removed call to java/io/Reader::close',
          location: { start: { line: 42, column: 1 }, end: { line: 42, column: 21 } },
          status: 'Survived'
        },
        {
          id: 49,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/utils/LineFactory::stringToAnnotatedLine to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 47, column: 1 }, end: { line: 47, column: 41 } },
          status: 'Killed'
        },
        {
          id: 50,
          mutatorName: 'MathMutator',
          description: 'Replaced integer addition with subtraction',
          location: { start: { line: 54, column: 1 }, end: { line: 54, column: 26 } },
          status: 'Killed'
        },
        {
          id: 51,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/utils/LineFactory$1::apply to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 55, column: 1 }, end: { line: 55, column: 17 } },
          status: 'Killed'
        },
        {
          id: 52,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/utils/LineFactory::getMutationsForLine to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 61, column: 1 }, end: { line: 61, column: 69 } },
          status: 'Killed'
        },
        {
          id: 53,
          mutatorName: 'ReturnValsMutator',
          description:
            'mutated return of Object value for org/pitest/elements/utils/LineFactory::isAtLineNumber to ( if (x != null) null else throw new RuntimeException )',
          location: { start: { line: 66, column: 1 }, end: { line: 66, column: 71 } },
          status: 'Killed'
        },
        {
          id: 54,
          mutatorName: 'NegateConditionalsMutator',
          description: 'negated conditional',
          location: { start: { line: 66, column: 1 }, end: { line: 66, column: 71 } },
          status: 'Killed'
        },
        {
          id: 55,
          mutatorName: 'ReturnValsMutator',
          description: 'replaced return of integer sized value with (x == 0 ? 1 : 0)',
          location: { start: { line: 66, column: 1 }, end: { line: 66, column: 71 } },
          status: 'Killed'
        }
      ]
    }
  }
};
