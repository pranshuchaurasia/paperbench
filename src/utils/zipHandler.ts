// ================================================================
// FILE: src/utils/zipHandler.ts
// PURPOSE: Extract YAML and image files from drag-drop ZIP uploads.
// DEPENDENCIES: jszip
// ================================================================

import JSZip from 'jszip';

export interface UploadBundle {
  yamlText: string;
  imageMap: Record<string, string>;
}

/**
 * Convert uploaded files into a YAML string plus relative-path image map.
 *
 * @param files - Files supplied by the user via drag-drop or file picker.
 * @returns Parsed bundle ready for validation.
 */
export async function readUploadBundle(files: File[]): Promise<UploadBundle> {
  const zipFile = files.find((file) => file.name.toLowerCase().endsWith('.zip'));
  if (zipFile) {
    return readZipBundle(zipFile);
  }

  const yamlFile = files.find((file) => /\.ya?ml$/i.test(file.name));
  if (!yamlFile) {
    throw new Error('No YAML file found in upload.');
  }

  const yamlText = await yamlFile.text();
  const imageMap: Record<string, string> = {};

  for (const file of files) {
    if (file === yamlFile) {
      continue;
    }

    if (/\.(png|jpe?g|gif|svg|webp)$/i.test(file.name)) {
      imageMap[file.webkitRelativePath || file.name] = URL.createObjectURL(file);
      imageMap[`images/${file.name}`] = imageMap[file.webkitRelativePath || file.name];
    }
  }

  return { yamlText, imageMap };
}

/**
 * Extract a ZIP file containing one YAML file and optional images.
 *
 * @param zipFile - Source ZIP upload.
 * @returns Bundle with YAML content and generated object URLs.
 */
export async function readZipBundle(zipFile: File): Promise<UploadBundle> {
  const archive = await JSZip.loadAsync(zipFile);
  let yamlText = '';
  const imageMap: Record<string, string> = {};

  await Promise.all(
    Object.values(archive.files).map(async (entry) => {
      if (entry.dir) {
        return;
      }

      if (/\.ya?ml$/i.test(entry.name)) {
        yamlText = await entry.async('string');
        return;
      }

      if (/\.(png|jpe?g|gif|svg|webp)$/i.test(entry.name)) {
        const blob = await entry.async('blob');
        imageMap[entry.name] = URL.createObjectURL(blob);
      }
    }),
  );

  if (!yamlText) {
    throw new Error('ZIP archive must include a YAML file.');
  }

  return { yamlText, imageMap };
}
