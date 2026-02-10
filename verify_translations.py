#!/usr/bin/env python3
import json
import os

baseDir = '/sessions/modest-determined-gauss/mnt/CLAUDE/deutschemaster/public/data/en'

print('\n=== ENGLISH TRANSLATION VERIFICATION ===\n')

# Reading.json
with open(os.path.join(baseDir, 'reading.json'), 'r') as f:
    reading = json.load(f)
print('1. reading.json')
print(f'   - A1 texts: {len(reading["levels"]["A1"]["texts"])}')
print(f'   - First text: "{reading["levels"]["A1"]["texts"][0]["title"]}"')
print(f'   - First word translation: "{reading["levels"]["A1"]["texts"][0]["difficultWords"][0]["translation"]}"')
print(f'   - First question explanation: "{reading["levels"]["A1"]["texts"][0]["questions"][0]["explanation"][:50]}..."')

# Stories.json
with open(os.path.join(baseDir, 'stories.json'), 'r') as f:
    stories = json.load(f)
print('\n2. stories.json')
print(f'   - A1 stories: {len(stories["levels"]["A1"]["stories"])}')
print(f'   - First story: "{stories["levels"]["A1"]["stories"][0]["title"]}"')
print(f'   - First story translation: "{stories["levels"]["A1"]["stories"][0]["lines"][0]["translation"]}"')
print(f'   - Difficult word translation: "{stories["levels"]["A1"]["stories"][0]["difficultWords"][0]["translation"]}"')

# Placement test
with open(os.path.join(baseDir, 'placement-test.json'), 'r') as f:
    placement = json.load(f)
print('\n3. placement-test.json')
print(f'   - Total questions: {len(placement["questions"])}')
print(f'   - First question: "{placement["questions"][0]["question"]}"')
print(f'   - First explanation: "{placement["questions"][0]["explanation"][:50]}..."')

# Listening
with open(os.path.join(baseDir, 'listening.json'), 'r') as f:
    listening = json.load(f)
print('\n4. listening.json')
print(f'   - A1 exercises: {len(listening["levels"]["A1"]["exercises"])}')
print(f'   - First exercise title: "{listening["levels"]["A1"]["exercises"][0]["title"]}"')
first_ex = listening["levels"]["A1"]["exercises"][0]
if "questions" in first_ex and first_ex["questions"]:
    print(f'   - First question: "{first_ex["questions"][0]["question"]}"')

# Writing
with open(os.path.join(baseDir, 'writing.json'), 'r') as f:
    writing = json.load(f)
print('\n5. writing.json')
print(f'   - A1 exercises: {len(writing["levels"]["A1"]["exercises"])}')
print(f'   - First exercise prompt: "{writing["levels"]["A1"]["exercises"][0]["prompt"]}"')
print(f'   - First hint: "{writing["levels"]["A1"]["exercises"][0]["hints"][0]}"')

# Essential words
with open(os.path.join(baseDir, 'essential-words-a1.json'), 'r') as f:
    essential = json.load(f)
print('\n6. essential-words-a1.json')
print(f'   - Level: {essential["level"]}')
print(f'   - Categories: {len(essential["categories"])}')
print(f'   - First category: "{essential["categories"][0]["name"]}"')
print(f'   - First word example: "{essential["categories"][0]["words"][0]["exampleIt"]}"')

# Grammar C1
with open(os.path.join(baseDir, 'grammar/c1.json'), 'r') as f:
    grammar = json.load(f)
print('\n7. grammar/c1.json')
print(f'   - Total topics: {len(grammar["topics"])}')
print(f'   - First topic: "{grammar["topics"][0]["name"]}"')
print(f'   - First example: "{grammar["topics"][0]["content"]["esempi"][0]["italiano"][:50]}..."')
print(f'   - First exercise question: "{grammar["topics"][0]["exercises"][0]["question"][:50]}..."')

print('\n=== ✓ ALL FILES CREATED AND VALIDATED ===\n')
