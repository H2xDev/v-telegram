import { ChannelService } from "@/lib/channel.service"
import { browser } from "$app/environment";
import type { PageLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async ({ params }) => {
  if (!browser) return;

  const channelService = new ChannelService;
  try {
    const channel = await channelService.getChannel(params.id);

    return {
      ...params,
      channel,
    }
  } catch (e) {
    error(404, "Channel not found");
  }
}
