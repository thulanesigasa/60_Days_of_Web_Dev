import subprocess
import os

print("Starting path cleanup...")

# Read the current tree
res = subprocess.run(['git', 'ls-tree', '-r', 'HEAD'], stdout=subprocess.PIPE, text=True, check=True)
lines = res.stdout.strip().split('\n')
new_index_lines = []

for line in lines:
    if not line: continue
    
    # Format: 100644 blob hash\tpath
    meta, path = line.split('\t', 1)
    
    # Clean the path
    clean_path = path.replace('\r', '')
    clean_path = clean_path.replace('"', '')
    clean_path = clean_path.replace('\\\\', '/')
    clean_path = clean_path.replace(' : ', '_')
    clean_path = clean_path.replace(':', '_')
    
    # Only keep the cleaned path
    new_index_lines.append(f'{meta}\t{clean_path}\n')

print(f"Cleaned {len(new_index_lines)} paths. Writing index...")

# Clear index
subprocess.run(['git', 'read-tree', '--empty'], check=True)

# Write new index
index_input = ''.join(new_index_lines).encode('utf-8')
proc = subprocess.Popen(['git', 'update-index', '--index-info'], stdin=subprocess.PIPE)
proc.communicate(input=index_input)

if proc.returncode != 0:
    print("Failed to update index")
    exit(1)

print("Index written. Committing...")

# Commit
subprocess.run(['git', 'commit', '-m', 'fix: clean up paths (remove \\r and replace colons)'], check=True)

print("Pushing...")
subprocess.run(['git', 'push', 'origin', 'HEAD'], check=True)
print("Done!")
