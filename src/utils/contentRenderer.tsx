// src/utils/contentRenderer.tsx
import React from "react";

/**
 * Checks if content contains HTML tags
 */
export const isHtmlContent = (content: string): boolean => {
  if (!content) return false;
  // Check for HTML tags - simple regex to detect if content contains HTML
  const htmlTagRegex = /<[^>]*>/;
  return htmlTagRegex.test(content);
};

/**
 * Renders content safely - HTML content as HTML, plain text with preserved line breaks
 */
export const renderContentSafely = (content: string): React.ReactNode => {
  if (!content) return null;

  if (isHtmlContent(content)) {
    // Render as HTML - consider adding DOMPurify for production
    return (
      <div
        className="prose prose-sm max-w-none rich-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  } else {
    // Render as plain text with line breaks preserved
    return (
      <div className="whitespace-pre-line break-words plain-content">
        {content}
      </div>
    );
  }
};

/**
 * Strips HTML tags from content for plain text display
 */
export const stripHtmlTags = (html: string): string => {
  if (!html) return "";
  // Simple HTML tag removal for preview text
  return html.replace(/<[^>]*>/g, "");
};

/**
 * Gets a preview of content with specified max length
 */
export const getContentPreview = (
  content: string,
  maxLength: number = 150
): string => {
  if (!content) return "";

  const plainText = isHtmlContent(content) ? stripHtmlTags(content) : content;
  return plainText.length > maxLength
    ? `${plainText.substring(0, maxLength)}...`
    : plainText;
};

export const getTextLength = (content: string): number => {
  if (!content) return 0;
  return isHtmlContent(content)
    ? stripHtmlTags(content).length
    : content.length;
};
