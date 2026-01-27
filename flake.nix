{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-25.11";
  };

  outputs = {
    self,
    nixpkgs,
    ...
  }: let
    inherit (nixpkgs) lib;
    forAllSystems = lib.genAttrs lib.systems.flakeExposed;
  in {
    packages = forAllSystems (system: let
      pkgs = import nixpkgs {inherit system;};
    in {
      default = pkgs.buildNpmPackage {
        name = "chalmers-search-exam";

        # buildInputs = with pkgs; [
        #   nodejs_latest
        # ];

        src = self;

        npmDepsHash = "sha256-ljgwbJFNPANpyOEnZWv8aUggIu/di/v00ZHK+Mv/HYI=";

        # npmDeps = pkgs.importNpmLock {
        #   npmRoot = self;
        # };

        # npmConfigHook = pkgs.importNpmLock.npmConfigHook;

        npmBuildScript = "build";

        installPhase = ''
          runHook preInstall

          mkdir -p $out/libexec
          cp -R lib node_modules package.json $out/libexec

          mkdir -p $out/bin
          makeWrapper ${pkgs.nodejs}/bin/node \
            $out/bin/cthexam \
            --add-flags "$out/libexec/lib/cli.js"

          runHook postInstall
        '';

        meta = {
          description = "Search exam dates at Chalmers";
          homepage = "https://github.com/olillin/chalmers-search-exam";
          license = lib.licenses.mit;
          maintainers = with lib.maintainers; [olillin];
        };
      };
    });
  };
}
