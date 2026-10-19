"use client";

import Link from "next/link";

import { track } from "./analytics/posthog";

type ContactLinkProps = React.ComponentProps<typeof Link> & { channel: string };

const ContactLink = ({ channel, ...props }: ContactLinkProps) => (
  <Link {...props} onClick={() => track("contact_click", { channel, variant: "footer" })} />
);

export default ContactLink;
