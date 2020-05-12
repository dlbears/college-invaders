import * as React from "react";

function SvgPlayer(props) {
  return (
    <svg width={572} height={330} viewBox="0 0 5720 3300" {...props}>
      <path d="M470 2160v-640h320v-320h1600V560h320V240h320v320h320v640h1600v320h320v1280H470v-640z" />
    </svg>
  );
}

export default SvgPlayer;
