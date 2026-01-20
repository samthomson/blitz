import { useMutation } from '@tanstack/react-query';
import { useNostrPublish } from './useNostrPublish';
import { useUploadFile } from './useUploadFile';

interface PublishShortParams {
  videoBlob: Blob;
  title: string;
  description: string;
}

// NIP-71 Kind 34236 for vertical videos
const KIND_VERTICAL_VIDEO = 34236;

export function usePublishShort() {
  const { mutateAsync: publishEvent } = useNostrPublish();
  const { mutateAsync: uploadFile } = useUploadFile();

  return useMutation({
    mutationFn: async ({ videoBlob, title, description }: PublishShortParams) => {
      // Convert blob to File for upload
      const videoFile = new File([videoBlob], `short-${Date.now()}.webm`, { 
        type: videoBlob.type || 'video/webm' 
      });

      // Upload to Blossom
      const tags = await uploadFile(videoFile);
      
      // tags is string[][] for unencrypted uploads
      if (!Array.isArray(tags) || !Array.isArray(tags[0])) {
        throw new Error('Unexpected upload response format');
      }

      // Extract URL from upload response (first tag is ["url", "https://..."])
      const urlTag = tags.find(t => t[0] === 'url');
      const url = urlTag?.[1];
      if (!url) {
        throw new Error('No URL returned from upload');
      }

      // Extract other metadata from upload response
      const mimeType = tags.find(t => t[0] === 'm')?.[1] || videoBlob.type || 'video/webm';
      const size = tags.find(t => t[0] === 'size')?.[1];
      const hash = tags.find(t => t[0] === 'x')?.[1];

      // Get video dimensions (default to vertical 9:16)
      const dim = '1080x1920';

      // Build imeta tag per NIP-71/NIP-92
      const imetaParts = [
        `url ${url}`,
        `m ${mimeType}`,
        `dim ${dim}`,
      ];
      if (size) imetaParts.push(`size ${size}`);
      if (hash) imetaParts.push(`x ${hash}`);

      // Generate unique d-tag
      const dTag = crypto.randomUUID();
      const publishedAt = Math.floor(Date.now() / 1000).toString();

      // Publish NIP-71 vertical video event
      const event = await publishEvent({
        kind: KIND_VERTICAL_VIDEO,
        content: description,
        tags: [
          ['d', dTag],
          ['title', title],
          ['published_at', publishedAt],
          ['imeta', ...imetaParts],
          ['t', 'short'],
        ],
      });

      return event;
    },
  });
}

