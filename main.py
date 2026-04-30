
#
# mapp_tier2 = {
#     "now-i-go": "https://stream.mux.com/xnri8fVYFRQphqtaAsn1aYlOu0200oOM8aeJKVMjykeCs/high.mp4",
#     "free-time-i-want": "https://stream.mux.com/VwnWH02r7uxGj5thAZHovjI7kzaA7HZ8a2hVj1HMVrBM/high.mp4",
#     "now-we-play" : "https://stream.mux.com/x6DeO01FV2k01smCNTnnW1c2MvFqLmz013RAECuBahyr8I/high.mp4",
#     "later-i-visit-friend-will" : "https://stream.mux.com/qsFztN2LvwUx6w3tyw2JuBsJpwLBzliaWjUtzL02dME00/high.mp4",
#     "nice-meet-you-again": "https://stream.mux.com/LTdKof4QFjhx1cqgvTUCv7aEYNXgAJHM7ki3HvHShJw/high.mp4",
#     "now-i-listen" : "https://stream.mux.com/LK7K6iuQm011Y2bzE6W4kkNaQ2gnwW028c6kLMeWbFejs/high.mp4",
#     "today-they-swim-finish": "https://stream.mux.com/cAcCajgnTwzMAfcs0062MnXbERO4Dt85HJMSmADKu002Q/high.mp4",
#     "later-they-go-to-movies-will": "https://stream.mux.com/gg012PT01pfz2ZW4VtZbyPX5lftMCU7uq00TbxoNnMxDkI/high.mp4",
#     "now-i-draw": "https://stream.mux.com/WDEULvWqvtxXUYvG3TAGbDIhjLRDh00czkUCNwiyG4Vw/high.mp4",
#     "now-i-go-to-cafe": "https://stream.mux.com/9kSguYsXNykRzZJcvgVvjaTH9s9kmef1JrlAT3G5dPM/high.mp4"
# }
#
# mapp_tier1 = {
#     "now": "https://stream.mux.com/aseGQAuzbit5Kb801pPkxXW1gYU5zLxIrs1OyGQ7Lhxc/high.mp4",
#     "later": "https://stream.mux.com/XjA17aH3yPB3FAGQUSiiKdiswnbRCZIM1zFgwhIl96k/high.mp4",
#     "today": "https://stream.mux.com/01G5ANhP8rz6CV1m2Foyj302R3PjbiMxf019xiP01WdO02Y4/high.mp4",
#     "go": "https://stream.mux.com/uepSvFRVRGh4rGqtHxNzwPQ400Kj00uJ5KnZdJuSn00AT00/high.mp4",
#     "play": "https://stream.mux.com/63POHlQfk6BojXFUjrGkW4B2iQ6DWq6h01eovBHtQhw8/high.mp4",
#     "visit": "https://stream.mux.com/o81JidI8xu4xdLoMhU6tOzMTTLxlx5klPYnI6DUeUtc/high.mp4",
#     "listen": "https://stream.mux.com/o81JidI8xu4xdLoMhU6tOzMTTLxlx5klPYnI6DUeUtc/high.mp4",
#     "draw": "https://stream.mux.com/UA2Y2z6WQQe8JFwaX3zuMXJoLlFHZ024RtAIWZFdMmyY/high.mp4",
#     "swim": "https://stream.mux.com/HTwcTfOKXrAu9q3AZant9DF1AOWaLNwGPZE02aZWfKYg/high.mp4",
#     "finish": "https://stream.mux.com/1Ei2zhaIrZCwNZa5lWmY01RZwNpIfvAOgTUNwukdBzVY/high.mp4"
# }
# VIDEO_URLS = [ old ones
#     "https://stream.mux.com/IuMAaOFCbSHCdz8XhoN1KyrhCxj9qyTi5EJ9x301Yyoc/high.mp4",
#     "https://stream.mux.com/6SDp2xWh6pk4mgvm4JTbMV4lsSAWEfNOAIOTquHHJd8/high.mp4",
#     "https://stream.mux.com/ziGZ9NtqKnFZwe900wtJwdrXXHjOxvAKhFwH8abaHnVc/high.mp4",
#     "https://stream.mux.com/OLNECuiLf71pHfCLnhbR6jTyaa9TKGEOyjWyVF1iewg/high.mp4",
#     "https://stream.mux.com/pTnfxTlR02adXTKuVCtouyXa7nIfIO3Be501kq02EZplXE/high.mp4",
#     "https://stream.mux.com/3ZjtBbBsWWyncBoUfKp2Km8VIq9d6w602PSsWfaXSeGA/high.mp4",
# ]

import os
import requests
from pathlib import Path

OUTPUT_DIR = r"C:\Users\manas\Projects\Sign-Language\video"

mapp_tier2 = {
    "now-i-go": "https://stream.mux.com/xnri8fVYFRQphqtaAsn1aYlOu0200oOM8aeJKVMjykeCs/high.mp4",
    "free-time-i-want": "https://stream.mux.com/VwnWH02r7uxGj5thAZHovjI7kzaA7HZ8a2hVj1HMVrBM/high.mp4",
    "now-we-play": "https://stream.mux.com/x6DeO01FV2k01smCNTnnW1c2MvFqLmz013RAECuBahyr8I/high.mp4",
    "later-i-visit-friend-will": "https://stream.mux.com/qsFztN2LvwUx6w3tyw2JuBsJpwLBzliaWjUtzL02dME00/high.mp4",
    "nice-meet-you-again": "https://stream.mux.com/LTdKof4QFjhx1cqgvTUCv7aEYNXgAJHM7ki3HvHShJw/high.mp4",
    "now-i-listen": "https://stream.mux.com/LK7K6iuQm011Y2bzE6W4kkNaQ2gnwW028c6kLMeWbFejs/high.mp4",
    "today-they-swim-finish": "https://stream.mux.com/cAcCajgnTwzMAfcs0062MnXbERO4Dt85HJMSmADKu002Q/high.mp4",
    "later-they-go-to-movies-will": "https://stream.mux.com/gg012PT01pfz2ZW4VtZbyPX5lftMCU7uq00TbxoNnMxDkI/high.mp4",
    "now-i-draw": "https://stream.mux.com/WDEULvWqvtxXUYvG3TAGbDIhjLRDh00czkUCNwiyG4Vw/high.mp4",
    "now-i-go-to-cafe": "https://stream.mux.com/9kSguYsXNykRzZJcvgVvjaTH9s9kmef1JrlAT3G5dPM/high.mp4",
}

mapp_tier1 = {
    "now": "https://stream.mux.com/aseGQAuzbit5Kb801pPkxXW1gYU5zLxIrs1OyGQ7Lhxc/high.mp4",
    "later": "https://stream.mux.com/XjA17aH3yPB3FAGQUSiiKdiswnbRCZIM1zFgwhIl96k/high.mp4",
    "today": "https://stream.mux.com/01G5ANhP8rz6CV1m2Foyj302R3PjbiMxf019xiP01WdO02Y4/high.mp4",
    "go": "https://stream.mux.com/uepSvFRVRGh4rGqtHxNzwPQ400Kj00uJ5KnZdJuSn00AT00/high.mp4",
    "play": "https://stream.mux.com/63POHlQfk6BojXFUjrGkW4B2iQ6DWq6h01eovBHtQhw8/high.mp4",
    "visit": "https://stream.mux.com/o81JidI8xu4xdLoMhU6tOzMTTLxlx5klPYnI6DUeUtc/high.mp4",
    "listen": "https://stream.mux.com/o81JidI8xu4xdLoMhU6tOzMTTLxlx5klPYnI6DUeUtc/high.mp4",
    "draw": "https://stream.mux.com/UA2Y2z6WQQe8JFwaX3zuMXJoLlFHZ024RtAIWZFdMmyY/high.mp4",
    "swim": "https://stream.mux.com/HTwcTfOKXrAu9q3AZant9DF1AOWaLNwGPZE02aZWfKYg/high.mp4",
    "finish": "https://stream.mux.com/1Ei2zhaIrZCwNZa5lWmY01RZwNpIfvAOgTUNwukdBzVY/high.mp4",
}

# Add all your mappings here, they will each get their own subfolder
ALL_MAPS = {
    "tier1": mapp_tier1,
    "tier2": mapp_tier2,
}

def download_video(name, url, output_path):
    print(f"  Downloading '{name}'")
    print(f"  Saving to {output_path}")

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }

    try:
        with requests.get(url, stream=True, headers=headers, timeout=60) as response:
            response.raise_for_status()

            total_size = int(response.headers.get("content-length", 0))
            downloaded = 0

            with open(output_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=1024 * 1024):
                    if chunk:
                        f.write(chunk)
                        downloaded += len(chunk)

                        if total_size:
                            pct = (downloaded / total_size) * 100
                            print(f"\r  Progress {pct:.1f}%", end="", flush=True)

            print(f"\n  Done ({downloaded / (1024 * 1024):.1f} MB)")
            return True

    except requests.exceptions.RequestException as e:
        print(f"\n  Failed {e}")
        return False

def download_map(label, video_map, base_dir):
    output_dir = Path(base_dir) / label
    output_dir.mkdir(parents=True, exist_ok=True)
    print(f"\nDownloading '{label}' into {output_dir}\n")

    success_count = 0
    fail_count = 0
    total = len(video_map)

    for i, (name, url) in enumerate(video_map.items(), start=1):
        print(f"[{i}/{total}]")
        output_path = output_dir / f"{name}.mp4"

        if output_path.exists():
            print(f"  Already exists, skipping '{name}'")
            success_count += 1
            print()
            continue

        success = download_video(name, url, output_path)
        if success:
            success_count += 1
        else:
            fail_count += 1
        print()

    print(f"'{label}' complete. {success_count} downloaded, {fail_count} failed.\n")

def main():
    for label, video_map in ALL_MAPS.items():
        download_map(label, video_map, OUTPUT_DIR)

if __name__ == "__main__":
    main()