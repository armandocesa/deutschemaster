import json

with open('src/i18n/it.json', 'r', encoding='utf-8') as f:
    it = json.load(f)

with open('src/i18n/en.json', 'r', encoding='utf-8') as f:
    en = json.load(f)

print("=== DETAILED ANALYSIS OF MISSING KEYS ===\n")
print("These keys are in Italian but missing in English:\n")

missing_keys = [
    'writing.completionDesc',
    'writing.exercise',
    'writing.exerciseCountLabel',
    'writing.exerciseTypeLabel',
    'writing.freeWritingDesc',
    'writing.levelLabel',
    'writing.loading',
    'writing.nextQuestion',
    'writing.reorderDesc',
    'writing.setupSubtitle',
    'writing.setupTitle',
    'writing.translation',
    'writing.translationDesc'
]

for key in missing_keys:
    parts = key.split('.')
    val = it
    for part in parts:
        val = val[part]
    print(f"  {key}: \"{val}\"")

print("\n=== DUPLICATE notFound CHECK ===")
print("English file has 'notFound' defined twice:")
print(f"  Line 469-471: {en['notFound']}")
print(f"  Line 487-491: (second definition)")
print("\nThis is a structural issue - the second one overwrites the first!")

print("\n=== Comparing similar keys ===")
print("\nwriting.setupTitle (IT only):")
print(f"  Value: \"{it['writing']['setupTitle']}\"")
print("\nwriting.setupSubtitle (IT only):")
print(f"  Value: \"{it['writing']['setupSubtitle']}\"")
print("\nwriting.translation (IT only):")
print(f"  Value: \"{it['writing']['translation']}\"")
print("\nwriting.translationDesc (IT only):")
print(f"  Value: \"{it['writing']['translationDesc']}\"")
print("\nwriting.completionDesc (IT only):")
print(f"  Value: \"{it['writing']['completionDesc']}\"")
print("\nwriting.reorderDesc (IT only):")
print(f"  Value: \"{it['writing']['reorderDesc']}\"")
print("\nwriting.freeWritingDesc (IT only):")
print(f"  Value: \"{it['writing']['freeWritingDesc']}\"")
print("\nwriting.exerciseTypeLabel (IT only):")
print(f"  Value: \"{it['writing']['exerciseTypeLabel']}\"")
print("\nwriting.levelLabel (IT only):")
print(f"  Value: \"{it['writing']['levelLabel']}\"")
print("\nwriting.exerciseCountLabel (IT only):")
print(f"  Value: \"{it['writing']['exerciseCountLabel']}\"")
print("\nwriting.loading (IT only):")
print(f"  Value: \"{it['writing']['loading']}\"")
print("\nwriting.exercise (IT only):")
print(f"  Value: \"{it['writing']['exercise']}\"")
print("\nwriting.nextQuestion (IT only):")
print(f"  Value: \"{it['writing']['nextQuestion']}\"")

print("\n\n=== Checking EN writing section for similar keys ===")
print("Keys in EN writing section that might be similar:")
for key in en['writing'].keys():
    print(f"  - {key}")

