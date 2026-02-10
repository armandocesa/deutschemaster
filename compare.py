import json
import sys

with open('src/i18n/it.json', 'r', encoding='utf-8') as f:
    it = json.load(f)

with open('src/i18n/en.json', 'r', encoding='utf-8') as f:
    en = json.load(f)

def get_all_keys(obj, prefix=''):
    keys = []
    for key, value in obj.items():
        full_key = f"{prefix}.{key}" if prefix else key
        if isinstance(value, dict):
            keys.extend(get_all_keys(value, full_key))
        else:
            keys.append(full_key)
    return keys

it_keys = sorted(set(get_all_keys(it)))
en_keys = sorted(set(get_all_keys(en)))

it_key_set = set(it_keys)
en_key_set = set(en_keys)

print("=== ITALIAN FILE ANALYSIS ===")
print(f"Total keys in Italian: {len(it_keys)}")

print("\n=== ENGLISH FILE ANALYSIS ===")
print(f"Total keys in English: {len(en_keys)}")

print("\n=== MISSING KEYS ===")
missing_in_en = [k for k in it_keys if k not in en_key_set]
missing_in_it = [k for k in en_keys if k not in it_key_set]

if missing_in_en:
    print(f"\nIn Italian but NOT in English ({len(missing_in_en)}):")
    for k in missing_in_en:
        print(f"  - {k}")

if missing_in_it:
    print(f"\nIn English but NOT in Italian ({len(missing_in_it)}):")
    for k in missing_in_it:
        print(f"  - {k}")

print("\n=== CHECKING FOR EMPTY/PLACEHOLDER VALUES ===")

def check_empty_values(obj, lang, prefix=''):
    issues = []
    for key, value in obj.items():
        full_key = f"{prefix}.{key}" if prefix else key
        if isinstance(value, dict):
            issues.extend(check_empty_values(value, lang, full_key))
        elif isinstance(value, str):
            if not value.strip() or value in ('PLACEHOLDER', '...'):
                issues.append(f"{lang}: {full_key} = \"{value}\"")
    return issues

it_empty = check_empty_values(it, 'IT')
en_empty = check_empty_values(en, 'EN')

if it_empty or en_empty:
    print('Found empty/placeholder values:')
    for e in it_empty:
        print(f"  {e}")
    for e in en_empty:
        print(f"  {e}")
else:
    print('No empty or placeholder values found.')

print("\n=== DUPLICATE KEY CHECK ===")
if len(it_keys) == len(it_key_set):
    print('Italian: No duplicate keys found.')
else:
    print(f'Italian: Found duplicate keys ({len(it_keys) - len(it_key_set)})')

if len(en_keys) == len(en_key_set):
    print('English: No duplicate keys found.')
else:
    print(f'English: Found duplicate keys ({len(en_keys) - len(en_key_set)})')

print("\n=== SUMMARY ===")
print(f"Keys match: {'YES' if len(it_keys) == len(en_keys) else 'NO'}")
print(f"Missing keys: {len(missing_in_en) + len(missing_in_it)}")
if not missing_in_en and not missing_in_it:
    print("\n✅ All translation keys are present and consistent!")
else:
    print(f"\n⚠️  Issues found - needs fixing")
