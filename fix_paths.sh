#!/bin/bash
set -e

SOURCE_COMMIT=${1:-HEAD}
echo "Starting path cleanup from $SOURCE_COMMIT..."

# Clear the current index
git read-tree --empty

# Stream the tree from the source commit, clean paths, and update index
git ls-tree -r "$SOURCE_COMMIT" | while IFS= read -r line; do
    if [ -z "$line" ]; then continue; fi
    
    # Format: 100644 blob hash\tpath
    meta="${line%%$'\t'*}"
    path="${line#*$'\t'}"
    
    # Split meta: mode type hash
    read -r mode type hash <<< "$meta"
    
    # Clean the path
    # Remove carriage returns
    clean_path="$(printf "%s\n" "$path" | tr -d '\r')"
    
    # Remove quotes around name if any (git ls-tree quotes special chars)
    # However, git update-index --index-info expects names without quotes 
    # unless they are properly escaped. We'll simplify.
    clean_path="${clean_path#\"}"
    clean_path="${clean_path%\"}"
    
    # Replace colons with underscores for Windows compatibility
    clean_path="${clean_path// : /_}"
    clean_path="${clean_path//:/_}"

    # Print to index-info: <mode> <hash>\t<path>
    printf "%s %s\t%s\n" "$mode" "$hash" "$clean_path"
done | git update-index --index-info

echo "Index updated. Committing changes..."
git commit -m "fix: restore content from $SOURCE_COMMIT and fix Windows path compatibility" || echo "No changes to commit"

echo "Pushing to origin..."
git push origin HEAD
echo "Done!"
